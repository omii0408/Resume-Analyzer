const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
    }
  }
});

// Helper function to extract text
const extractText = async (file) => {
  if (file.mimetype === 'application/pdf') {
    try {
      // Step 1: Reconstruct the PDF using pdf-lib to fix any 'bad XRef entry' issues
      const pdfDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
      const reconstructedPdfBytes = await pdfDoc.save();
      
      // Step 2: Parse the clean, reconstructed PDF
      const data = await pdfParse(Buffer.from(reconstructedPdfBytes));
      return data.text;
    } catch (err) {
      console.warn("pdf-lib reconstruction failed, attempting direct parse...", err);
      // Fallback to direct parse if reconstruction fails for some reason
      const data = await pdfParse(file.buffer);
      return data.text;
    }
  } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }
  return '';
};

// POST /api/analyze
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const file = req.file;
    const jobDescription = req.body.jobDescription;

    if (!file) {
      return res.status(400).json({ error: 'Resume file is required.' });
    }
    if (!jobDescription || jobDescription.trim() === '') {
      return res.status(400).json({ error: 'Job description is required.' });
    }

    // 1. Extract text from resume
    const resumeText = await extractText(file);

    // 2. Initialize Gemini
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // 3. Request AI Analysis
    const prompt = `
      You are an expert ATS (Applicant Tracking System) and career coach.
      Analyze the following resume against the provided job description.
      
      Resume Text:
      ${resumeText}
      
      Job Description:
      ${jobDescription}
      
      Provide a comprehensive analysis in JSON format with these exact keys:
      - ATS_score: A score from 0-100 based on how well the resume is formatted for ATS.
      - match_percentage: A percentage from 0-100 showing how well the candidate's skills match the job.
      - missing_skills: An array of key technical or soft skills found in the JD but missing from the resume.
      - strengths: An array of 3-4 key strengths the candidate has for this specific role.
      - weaknesses: An array of 2-3 areas where the candidate falls short.
      - improvements: An array of actionable advice to improve the resume.
      - rewritten_points: An array of 2-3 bullet points from the resume rewritten to be more impactful.
      - final_verdict: A short, professional summary of the candidate's fit.
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = JSON.parse(result.response.text());
    res.json(aiResponse);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during analysis.' });
  }
});

module.exports = router;