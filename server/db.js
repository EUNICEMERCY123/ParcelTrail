// Database connection setup using Mongoose (Module 5 & 6)
const mongoose = require('mongoose');

// Resolves connection string from environment or falls back to local instance
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parcelTrail';

// Connects to MongoDB database with Mongoose
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[MongoDB] Connected to database');
  } catch (error) {
    console.error('[MongoDB] Connection failure:', error.message);
    process.exit(1);
  }
}

module.exports = { connectDB, mongoose };
