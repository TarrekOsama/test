const User = require('../models/User');
const Call = require('../models/Call');
const APIError = require('../utils/APIError');
const logger = require('../utils/logger');

// Adds a new user (admin-only)
exports.addUser = async (req, res, next) => {
  const { name, email, balance, phone, from } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new APIError('User already exists', 400);
    }
    const password = 'defaultpassword';  // Default password for admin-added users
    const newUser = new User({ name, email, password, balance: balance || 10, role: 'user', phone, from: from || '+1234567890' });
    await newUser.save();
    res.json({ success: true, userId: newUser._id });
  } catch (error) {
    logger.error(`Add User Error: ${error.message}`);
    next(error);
  }
};

// Fetches admin statistics
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();  // Total number of users
    const totalCalls = await Call.countDocuments();  // Total number of calls
    const totalUsedBalance = await User.aggregate([
      { $group: { _id: null, total: { $sum: { $subtract: [10, '$balance'] } } } }  // Calculates used balance
    ]).then(result => result[0]?.total || 0);
    res.json({ totalCalls, totalUsers, totalUsedBalance });
  } catch (error) {
    logger.error(`Get Admin Stats Error: ${error.message}`);
    next(new APIError('Failed to fetch admin stats', 500));
  }
};