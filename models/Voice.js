const mongoose = require('mongoose');

// Voice schema for storing voice details
const voiceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },  // Unique voice name (e.g., "maya")
  description: { type: String },                        // Optional voice description
  created_at: { type: Date, default: Date.now }         // Timestamp of voice addition
});

module.exports = mongoose.model('Voice', voiceSchema);