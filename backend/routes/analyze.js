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

    // 2. Initialize OpenAI
    const OpenAI = require("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 3. Request AI Analysis
    const prompt = `
      You are an expert ATS (Applicant Tracking System) and career coach.
      Analyze the following resume against the provided job description.
      
      Resume Text:
      ${resumeText}
      
      Job Description:
      ${jobDescription}
      
      Provide a comprehensive analysis. YOU MUST RETURN ONLY A VALID JSON OBJECT with these exact keys:
      - ATS_score: A score from 0-100.
      - match_percentage: A percentage from 0-100.
      - missing_skills: An array of strings.
      - strengths: An array of strings.
      - weaknesses: An array of strings.
      - improvements: An array of strings.
      - rewritten_points: An array of strings.
      - final_verdict: A short string.

      Return ONLY the JSON. No markdown tags.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    res.json(aiResponse);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during analysis.' });
  }
});

module.exports = router;