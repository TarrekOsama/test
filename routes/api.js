const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const restrictTo = require('../middleware/restrictTo');
const callController = require('../controllers/callController');
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const { body, validationResult } = require('express-validator');

// Validation middleware for login inputs
const validateLogin = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Public routes
router.post('/login', validateLogin, userController.login);  // Logs in a user

// Protected routes (require authentication)
router.post('/add-user', auth, userController.addUser);  // Adds a new user
router.get('/users', auth, userController.getUsers);  // Lists all users
router.post('/send-call', auth, callController.sendCall);  // Initiates a call
router.post('/analyze-call/:callId', auth, callController.analyzeCall);  // Analyzes a call
router.get('/call-logs', auth, callController.getCallLogs);  // Fetches call logs
router.post('/stop-call/:callId', auth, callController.stopCall);  // Stops a call
router.get('/get-transcript', auth, callController.getTranscript);  // Gets call transcript
router.get('/calls/:userId', auth, callController.getUserCalls);  // Lists user’s calls
router.get('/user-stats/:userId', auth, callController.getUserStats);  // Gets user stats
router.get('/voices', auth, callController.getVoices);  // Lists available voices
router.get('/download-recording/:callId', auth, callController.downloadRecording);  // Downloads recording
router.post('/report-call/:callId', auth, callController.reportCall);  // Reports a call

// Admin routes (require admin role)
router.post('/admin/add-user', auth, restrictTo('admin'), adminController.addUser);  // Admin adds user
router.get('/admin/stats', auth, restrictTo('admin'), adminController.getAdminStats);  // Admin stats

module.exports = router;