// Custom error class for API responses
class APIError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;  // HTTP status code (e.g., 400, 500)
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';  // 4xx: fail, 5xx: error
      this.isOperational = true;  // Marks as operational (non-system) error
    }
  }
  
  module.exports = APIError;