const User = require('../models/User');
const jwt = require('jsonwebtoken');
const APIError = require('../utils/APIError');
const logger = require('../utils/logger');

// Logs in a user and issues a JWT token
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new APIError('Invalid credentials', 401);  // Invalid email or password
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token, userId: user._id, role: user.role });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

// Adds a new user
exports.addUser = async (req, res, next) => {
  const { name, email, password, balance, role, phone, from } = req.body;
  try {
    const newUser = new User({ name, email, password, balance: balance || 10, role: role || 'user', phone, from: from || '+1234567890' });
    await newUser.save();
    res.json({ success: true, userId: newUser._id });
  } catch (error) {
    logger.error(`Add user error: ${error.message}`);
    next(new APIError('Failed to add user', 500));
  }
};

// Fetches all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    logger.error(`Get users error: ${error.message}`);
    next(new APIError('Failed to fetch users', 500));
  }
};