const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 * Initializes the connection with optimized settings for production
 */
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 45000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    console.log('✓ MongoDB Atlas connected successfully');
    return mongoose.connection;
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
  } catch (err) {
    console.error('✗ MongoDB disconnection failed:', err.message);
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  mongoose
};
