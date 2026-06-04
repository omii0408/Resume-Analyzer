const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("Environment Variables:");
console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "Loaded (length " + process.env.OPENROUTER_API_KEY.length + ")" : "Not found");
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "Loaded (length " + process.env.OPENAI_API_KEY.length + ")" : "Not found");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Loaded (length " + process.env.GEMINI_API_KEY.length + ")" : "Not found");

const OpenAI = require("openai");

const testOpenRouter = async () => {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("\n[ERROR] No API key found. Please define OPENROUTER_API_KEY or OPENAI_API_KEY.");
    return;
  }

  console.log("\nTesting OpenRouter API call using key starting with:", apiKey.substring(0, 10) + "...");
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "AI Resume Analyzer Diagnostic",
    }
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemma-3-4b-it:free",
      messages: [{ role: "user", content: "Hello! Say 'test successful' in one sentence." }],
    });
    console.log("OpenRouter SUCCESS:", completion.choices[0].message.content);
  } catch (err) {
    console.error("OpenRouter FAILED:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
  }
};

testOpenRouter();
