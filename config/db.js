const mongoose = require('mongoose');

// Function to connect to MongoDB using the MONGO_URI environment variable
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);  // Exits the process with failure code if connection fails
  }
};

module.exports = connectDB;