const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

// Load .env from the backend directory explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: confirm API key is loaded
console.log('OPENROUTER_API_KEY loaded:', process.env.OPENROUTER_API_KEY ? '✅ YES (length: ' + process.env.OPENROUTER_API_KEY.length + ')' : '❌ NOT FOUND');

const app = express();
app.use(cors());
app.use(express.json());

const analyzeRoutes = require('./routes/analyze');

app.use('/api', analyzeRoutes);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
