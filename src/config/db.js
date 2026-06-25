const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    // process.exit(1) causes Vercel FUNCTION_INVOCATION_FAILED.
    // In serverless, we log the error instead of killing the process.
    throw error;
  }
};

module.exports = connectDB;
