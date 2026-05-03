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

    // 2. Mock AI Analysis Delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 3. Mocked AI Response
    const mockResponse = {
      ATS_score: 75,
      match_percentage: 68,
      missing_skills: [
        "Docker",
        "Kubernetes",
        "GraphQL"
      ],
      strengths: [
        "Strong React background",
        "Good understanding of Node.js",
        "Demonstrated experience in UI/UX"
      ],
      weaknesses: [
        "Lack of cloud deployment experience",
        "No mention of CI/CD pipelines"
      ],
      improvements: [
        "Add quantifiable metrics to your recent job experience",
        "Include links to live projects or GitHub repositories",
        "Highlight any experience with Agile methodologies"
      ],
      rewritten_points: [
        "Developed and maintained React-based frontend applications resulting in a 20% increase in user retention.",
        "Collaborated with backend teams to integrate RESTful APIs seamlessly into the client-side infrastructure."
      ],
      final_verdict: "Good potential but needs more emphasis on DevOps and modern deployment tools to fully match the requirements."
    };

    res.json(mockResponse);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during analysis.' });
  }
});

module.exports = router;