require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { processData } = require('./processor');
const { connectDB, disconnectDB } = require('./db');
const Analysis = require('./models/Analysis');

const api = express();

/**
 * CORS Configuration
 * Allows frontend origins with credentials support
 */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      process.env.FRONTEND_URL || 'https://bajaj-finserv-health-challenge.vercel.app'
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

api.use(cors(corsOptions));
api.use(express.json());

/**
 * POST /bfhl handler
 * Accepts an array of edge strings, processes them, and saves results to MongoDB
 */
async function handleBfhlPost(req, res, next) {
  // Validate request body
  if (!req.body.data || !Array.isArray(req.body.data)) {
    return res.status(400).json({ error: 'data array is required' });
  }

  try {
    const startTime = Date.now();

    // Process the data
    const insights = processData(req.body.data);

    // Build response with user metadata
    const payload = {
      user_id: process.env.USER_ID,
      email_id: process.env.EMAIL_ID,
      college_roll_number: process.env.ROLL_NUMBER,
      ...insights
    };

    // Save to MongoDB Atlas (non-blocking)
    if (api.locals.db) {
      try {
        const analysis = new Analysis({
          user_id: process.env.USER_ID,
          email_id: process.env.EMAIL_ID,
          roll_number: process.env.ROLL_NUMBER,
          input_edges: req.body.data,
          hierarchies: insights.hierarchies,
          invalid_entries: insights.invalid_entries,
          duplicate_edges: insights.duplicate_edges,
          summary: insights.summary,
          processing_time_ms: Date.now() - startTime,
          ip_address: req.ip
        });

        await analysis.save();
        console.log('✓ Analysis saved to MongoDB');
      } catch (dbErr) {
        console.error('Warning: Failed to save to MongoDB:', dbErr.message);
        // Don't fail the API response if DB save fails
      }
    }

    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /bfhl/history
 * Retrieve analysis history for the current user
 */
async function getAnalysisHistory(req, res, next) {
  try {
    if (!api.locals.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const limit = parseInt(req.query.limit) || 10;
    const history = await Analysis.getUserHistory(process.env.USER_ID, limit);

    res.status(200).json({
      user_id: process.env.USER_ID,
      total_records: history.length,
      analyses: history
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /bfhl/recent
 * Retrieve recent analyses from all users
 */
async function getRecentAnalyses(req, res, next) {
  try {
    if (!api.locals.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const limit = parseInt(req.query.limit) || 5;
    const recent = await Analysis.getRecent(limit);

    res.status(200).json({
      total_records: recent.length,
      recent_analyses: recent
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /bfhl/cycles
 * Retrieve analyses that contain cycles
 */
async function getAnalysesWithCycles(req, res, next) {
  try {
    if (!api.locals.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const cycles = await Analysis.getAnalysesWithCycles();

    res.status(200).json({
      total_with_cycles: cycles.length,
      analyses: cycles
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /health
 * Health check endpoint
 */
function getHealth(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: api.locals.db ? 'connected' : 'disconnected'
  });
}

/**
 * GET /
 * Root endpoint - API information
 */
function getRootInfo(req, res) {
  res.status(200).json({
    name: 'BFHL Tree Analyzer API',
    version: '1.0.0',
    description: 'Binary Frequency Hierarchical List - Tree Analysis API',
    endpoints: {
      'POST /bfhl': 'Analyze tree data (main endpoint)',
      'GET /health': 'Health check with DB status',
      'GET /bfhl/history?limit=10': 'Get user analysis history',
      'GET /bfhl/recent?limit=5': 'Get recent analyses',
      'GET /bfhl/cycles': 'Get analyses with cycles'
    },
    database: api.locals.db ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
}

/**
 * Global error handler
 */
function globalErrorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message });
}

// Register routes
api.get('/', getRootInfo);
api.post('/bfhl', handleBfhlPost);
api.get('/bfhl/history', getAnalysisHistory);
api.get('/bfhl/recent', getRecentAnalyses);
api.get('/bfhl/cycles', getAnalysesWithCycles);
api.get('/health', getHealth);

// Register error handler
api.use(globalErrorHandler);

// Start server with MongoDB connection
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    api.locals.db = true;

    // Start Express server
    api.listen(PORT, () => {
      console.log(`✓ BFHL API running on port ${PORT}`);
      console.log(`✓ MongoDB Atlas connected`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      await disconnectDB();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      await disconnectDB();
      process.exit(0);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

