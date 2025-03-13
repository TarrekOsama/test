require('dotenv').config();  // Loads environment variables from .env
const express = require('express');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const morgan = require('morgan');
const logger = require('./utils/logger');

const app = express();

// Connects to MongoDB
connectDB();

// Middleware setup
app.use(rateLimiter);  // Applies rate limiting to all routes
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));  // Logs HTTP requests
app.use(express.json());  // Parses JSON request bodies
app.use('/api', apiRoutes);  // Mounts API routes at /api

// Serve frontend (uncomment after building frontend)
// app.use(express.static('../frontend/dist/bot-website'));

// Global error handler
app.use(errorHandler);

// Starts the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));