const APIError = require('../utils/APIError');
const logger = require('../utils/logger');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  if (err instanceof APIError) {
    // Custom API error response
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Logs unexpected errors and returns generic response
    logger.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

module.exports = errorHandler;