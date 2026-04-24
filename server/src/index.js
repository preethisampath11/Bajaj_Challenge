require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { processData } = require('./processor');

const api = express();

api.use(cors());
api.use(express.json());

/**
 * POST /bfhl handler
 * Accepts an array of edge strings and returns structured hierarchy analysis
 */
async function handleBfhlPost(req, res, next) {
  // Validate request body
  if (!req.body.data || !Array.isArray(req.body.data)) {
    return res.status(400).json({ error: 'data array is required' });
  }

  try {
    // Process the data
    const insights = processData(req.body.data);

    // Build response with user metadata
    const payload = {
      user_id: process.env.USER_ID,
      email_id: process.env.EMAIL_ID,
      college_roll_number: process.env.ROLL_NUMBER,
      ...insights
    };

    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

/**
 * Global error handler
 */
function globalErrorHandler(err, req, res, next) {
  console.error(err.message);
  res.status(500).json({ error: err.message });
}

// Register routes
api.post('/bfhl', handleBfhlPost);

// Register error handler
api.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 3001;
api.listen(PORT, () => console.log(`BFHL API running on port ${PORT}`));
