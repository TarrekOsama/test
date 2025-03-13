const APIError = require('../utils/APIError');

// Middleware to restrict access based on user roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {  // Checks if user's role is allowed
      return next(new APIError('You do not have permission to perform this action', 403));
    }
    next();  // Proceeds if role matches
  };
};

module.exports = restrictTo;