const rateLimit = require('express-rate-limit');

// Rate limiter configuration: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15-minute window in milliseconds
  max: 100,                  // Maximum requests per IP in window
  message: 'Too many requests from this IP, please try again later.'  // Error message
});

module.exports = limiter;