const jwt = require('jsonwebtoken');
const APIError = require('../utils/APIError');
const logger = require('../utils/logger');  // Import logger for consistent logging
const User = require('../models/User');  // Import User model for validation

// Middleware to verify JWT tokens in request headers
const auth = (req, res, next) => {
  // Extract token from Authorization header (preferred method)
  let token = req.header('Authorization')?.replace('Bearer ', '');

  // Optionally allow token from cookies (disable query for security)
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  // Reject if no token is provided
  if (!token) {
    return next(new APIError('No token provided', 401));
  }

  try {
    // Verify JWT_SECRET exists
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Verify token (jwt.verify handles format validation)
    const decoded = jwt.verify(token, jwtSecret);

    // Validate decoded payload (ensure expected fields exist)
    if (!decoded.userId || !decoded.role) {
      return next(new APIError('Invalid token payload', 401));
    }

    // Optional: Fetch user from database to ensure they still exist
    const user = User.findById(decoded.userId);
    if (!user) {
      return next(new APIError('User not found', 401));
    }

    // Attach decoded user info to request
    req.user = decoded;
    next(); // Proceed to next middleware/route
  } catch (error) {
    // Log error using Winston logger
    logger.error(`JWT Verification Error: ${error.message}`);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return next(new APIError('Token expired', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new APIError('Invalid token', 401));
    }

    // Handle other errors
    next(new APIError('Authentication failed', 401));
  }
};

module.exports = auth;