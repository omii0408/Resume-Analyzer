const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Lazy initialization helper for AI client (OpenRouter, OpenAI, or direct Google Gemini)
let aiClient;
let selectedModel = 'google/gemma-3-4b-it:free';
let provider = 'openrouter';

function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing API Key. Please configure OPENROUTER_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in your environment variables (.env file).");
    }

    const isOpenRouter = apiKey.startsWith('sk-or-');
    const isGemini = apiKey.startsWith('AIzaSy') || apiKey.startsWith('AQ.');
    const isOpenAI = apiKey.startsWith('sk-proj-') || (apiKey.startsWith('sk-') && !apiKey.startsWith('sk-or-') && !isGemini);

    if (isGemini) {
      console.log("Detected Google Gemini API Key. Using official Google Gen AI SDK and gemini-2.5-flash model.");
      provider = 'gemini';
      selectedModel = 'gemini-2.5-flash';
      aiClient = new GoogleGenerativeAI(apiKey);
    } else if (isOpenAI) {
      console.log("Detected OpenAI API Key. Using standard OpenAI endpoint and gpt-4o-mini model.");
      provider = 'openai';
      selectedModel = 'gpt-4o-mini';
      aiClient = new OpenAI({
        apiKey: apiKey
      });
    } else if (isOpenRouter) {
      console.log("Detected OpenRouter API Key. Using OpenRouter endpoint and google/gemma-3-4b-it:free model.");
      provider = 'openrouter';
      selectedModel = 'google/gemma-3-4b-it:free';
      aiClient = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
        defaultHeaders: {
          'HTTP-Referer': 'https://resume-analyzer-8qrssy8bl-omii0408s-projects.vercel.app/',
          'X-Title': 'AI Resume Analyzer',
        }
      });
    } else {
      console.log("Unknown API Key format. Defaulting to OpenRouter configuration.");
      provider = 'openrouter';
      selectedModel = 'google/gemma-3-4b-it:free';
      aiClient = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
        defaultHeaders: {
          'HTTP-Referer': 'https://resume-analyzer-8qrssy8bl-omii0408s-projects.vercel.app/',
          'X-Title': 'AI Resume Analyzer',
        }
      });
    }
  }
  return { client: aiClient, model: selectedModel, provider };
}

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

    // 2. OpenAI/OpenRouter client is initialized at the top of the file

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

    const { client, model, provider } = getAIClient();
    let responseText;

    if (provider === 'gemini') {
      const modelInstance = client.getGenerativeModel({ model: model });
      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      responseText = response.text();
    } else {
      const completion = await client.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
      });
      responseText = completion.choices[0].message.content;
    }
    
    // Robust JSON parsing (handles markdown blocks if AI includes them)
    let aiResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      aiResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON Parse Error:", responseText);
      throw new Error("Failed to parse AI response. The AI returned: " + responseText.substring(0, 100));
    }
    
    res.json(aiResponse);

  } catch (error) {
    console.error('Analysis error:', error);
    let errorMessage = error.message || 'An error occurred during analysis.';
    
    // Add helpful instructions for 429 quota errors
    if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      errorMessage = "Your API Key has exceeded its quota limit. To resolve this, you can:\n" +
        "1. Check your OpenAI billing/billing setup (for standard OpenAI keys).\n" +
        "2. Or register a free OpenRouter key (starts with 'sk-or-') and set it as OPENROUTER_API_KEY in your backend/.env file.\n" +
        "3. Or get a free Gemini API key (starts with 'AIzaSy') from Google AI Studio and set it as GEMINI_API_KEY in your backend/.env file.";
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

module.exports = router;