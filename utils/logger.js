const winston = require('winston');

// Logger instance for application-wide logging
const logger = winston.createLogger({
  level: 'info',  // Logs info level and above (info, warn, error)
  format: winston.format.json(),  // Logs in JSON format
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),  // Errors to error.log
    new winston.transports.File({ filename: 'combined.log' })  // All logs to combined.log
  ]
});

// Adds console logging in development mode
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()  // Simple text format for console
  }));
}

module.exports = logger;