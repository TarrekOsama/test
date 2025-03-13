const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User schema with fields and constraints
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },          // User's full name
  email: { type: String, required: true, unique: true },  // Unique email for login
  password: { type: String, required: true },      // Hashed password
  balance: { type: Number, default: 10 },          // Balance for making calls (default: 10 units)
  role: { type: String, enum: ['user', 'admin'], default: 'user' },  // User role (user or admin)
  phone: { type: String },                         // User's phone number (optional)
  from: { type: String, default: '+1234567890' }   // ((get number from bland)) Default caller ID for outgoing calls
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  // Skip if password unchanged
  this.password = await bcrypt.hash(this.password, 10);  // Hash with 10 salt rounds
  next();
});

// Method to compare input password with stored hash
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);  // Returns true if match
};

module.exports = mongoose.model('User', userSchema);