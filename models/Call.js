const mongoose = require('mongoose');

// Call schema to track call details
const callSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Links to User
  record_URL: { type: String, required: true },  // URL of the call recording
  created_at: { type: Date, default: Date.now }  // Timestamp of call creation
});

module.exports = mongoose.model('Call', callSchema);