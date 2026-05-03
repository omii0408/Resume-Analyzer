const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

dotenv.config();

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
