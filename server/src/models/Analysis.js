const mongoose = require('mongoose');

/**
 * Analysis Schema - Stores BFHL tree analysis results
 * Records user submissions, tree hierarchies, and flagged entries
 */
const analysisSchema = new mongoose.Schema(
  {
    // User metadata
    user_id: {
      type: String,
      required: true,
      index: true
    },
    email_id: {
      type: String,
      required: true
    },
    roll_number: {
      type: String,
      required: true
    },

    // Input data
    input_edges: {
      type: [String],
      required: true,
      description: 'Original edge strings submitted by user'
    },

    // Processing results
    hierarchies: {
      type: [
        {
          root: String,
          tree: mongoose.Schema.Types.Mixed,
          depth: Number,
          has_cycle: Boolean
        }
      ],
      default: []
    },

    invalid_entries: {
      type: [String],
      default: []
    },

    duplicate_edges: {
      type: [String],
      default: []
    },

    // Summary statistics
    summary: {
      total_trees: {
        type: Number,
        default: 0
      },
      total_cycles: {
        type: Number,
        default: 0
      },
      largest_tree_root: {
        type: String,
        default: null
      }
    },

    // Metadata
    processing_time_ms: {
      type: Number,
      default: 0
    },
    ip_address: String
  },
  {
    timestamps: true,
    collection: 'analyses'
  }
);

// Index for efficient queries by user and date
analysisSchema.index({ user_id: 1, createdAt: -1 });
analysisSchema.index({ email_id: 1 });
analysisSchema.index({ roll_number: 1 });

/**
 * Get analysis history for a user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum results (default 10)
 */
analysisSchema.statics.getUserHistory = async function (userId, limit = 10) {
  return this.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-input_edges -hierarchies'); // Exclude large fields for list view
};

/**
 * Get recent analyses (last N by timestamp)
 * @param {number} limit - Number of recent records (default 5)
 */
analysisSchema.statics.getRecent = async function (limit = 5) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('user_id email_id summary createdAt');
};

/**
 * Get analyses with cycles
 */
analysisSchema.statics.getAnalysesWithCycles = async function () {
  return this.find({ 'summary.total_cycles': { $gt: 0 } })
    .sort({ createdAt: -1 })
    .select('user_id summary createdAt');
};

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;
