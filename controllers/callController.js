const axios = require('axios');
const blandConfig = require('../config/bland');
const User = require('../models/User');
const Call = require('../models/Call');
const Voice = require('../models/Voice');
const nodemailer = require('nodemailer');
const APIError = require('../utils/APIError');
const logger = require('../utils/logger');

// Initiates a call using Bland AI
exports.sendCall = async (req, res, next) => {
  const { userId, phone, prompt, voice, temperature, interruption_threshold, background_audio } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user || user.balance <= 0) {
      throw new APIError('Insufficient balance or user not found', 400);
    }

    // *** BLAND AI INTEGRATION: Send call ***
    const response = await axios.post(blandConfig.endpoints.sendCall, {
      phone_number: phone || user.phone,  // Recipient’s phone number
      from: user.from,                    // Caller ID
      task: prompt || 'Say hello and ask how they are.',  // Call script
      voice: voice || 'maya',             // Voice selection
      wait_for_greeting: true,            // Waits for greeting before proceeding
      temperature: temperature || 0.7,    // Controls voice tone
      interruption_threshold: interruption_threshold || 0.5,  // Sensitivity to interruptions
      background_audio: background_audio || null  // Optional background sound
    }, { headers: blandConfig.headers });

    user.balance -= 1;  // Deducts 1 unit from balance (simplified cost model)
    await user.save();

    const newCall = new Call({
      user_id: user._id,
      record_URL: response.data.record_url || 'placeholder_url'  // Stores recording URL
    });
    await newCall.save();

    sendEmail(user.email, 'Call Follow-up', 'Thanks for your time on the call!');
    res.json({ success: true, callId: response.data.call_id });
  } catch (error) {
    logger.error(`Send Call Error: ${error.message}`);
    next(new APIError('Failed to initiate call', 500));
  }
};

// Analyzes a call using Bland AI
exports.analyzeCall = async (req, res, next) => {
  const { callId } = req.params;
  try {
    // *** BLAND AI INTEGRATION: Analyze call ***
    const response = await axios.post(blandConfig.endpoints.analyzeCall(callId), {}, {
      headers: blandConfig.headers
    });
    res.json(response.data);  // Returns analysis results
  } catch (error) {
    logger.error(`Analyze Call Error: ${error.message}`);
    next(new APIError('Failed to analyze call', 500));
  }
};

// Fetches call logs from Bland AI
exports.getCallLogs = async (req, res, next) => {
  try {
    // *** BLAND AI INTEGRATION: Get call logs ***
    const response = await axios.get(blandConfig.endpoints.callLogs, {
      headers: blandConfig.headers
    });
    res.json(response.data);  // Returns call log data
  } catch (error) {
    logger.error(`Get Call Logs Error: ${error.message}`);
    next(new APIError('Failed to fetch call logs', 500));
  }
};

// Stops an active call using Bland AI
exports.stopCall = async (req, res, next) => {
  const { callId } = req.params;
  try {
    // *** BLAND AI INTEGRATION: Stop call ***
    const response = await axios.post(blandConfig.endpoints.stopCall(callId), {}, {
      headers: blandConfig.headers
    });
    res.json({ success: true, message: 'Call stopped', data: response.data });
  } catch (error) {
    logger.error(`Stop Call Error: ${error.message}`);
    next(new APIError('Failed to stop call', 500));
  }
};

// Retrieves a call transcript from Bland AI
exports.getTranscript = async (req, res, next) => {
  try {
    // *** BLAND AI INTEGRATION: Get transcript ***
    const response = await axios.get(blandConfig.endpoints.getTranscript, {
      headers: blandConfig.headers
    });
    res.json(response.data);  // Returns transcript data
  } catch (error) {
    logger.error(`Get Transcript Error: ${error.message}`);
    next(new APIError('Failed to fetch transcript', 500));
  }
};

// Fetches calls for a specific user
exports.getUserCalls = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const calls = await Call.find({ user_id: userId }).populate('user_id', 'name phone');
    res.json(calls);  // Returns user’s call records
  } catch (error) {
    logger.error(`Get User Calls Error: ${error.message}`);
    next(new APIError('Failed to fetch user calls', 500));
  }
};

// Gets statistics for a specific user
exports.getUserStats = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    const calls = await Call.countDocuments({ user_id: userId });
    const totalUsedBalance = 10 - user.balance;  // Assumes starting balance of 10
    res.json({
      name: user.name,
      balance: user.balance,
      totalCalls: calls,
      totalUsedBalance
    });
  } catch (error) {
    logger.error(`Get User Stats Error: ${error.message}`);
    next(new APIError('Failed to fetch user stats', 500));
  }
};

// Fetches available voices from Bland AI and syncs with local database
exports.getVoices = async (req, res, next) => {
  try {
    // *** BLAND AI INTEGRATION: Fetch voices ***
    const response = await axios.get(blandConfig.endpoints.getVoices, {
      headers: blandConfig.headers
    });
    const voices = response.data;  // Assumes response is an array of voice objects

    // Syncs voices with local database
    for (const voice of voices) {
      await Voice.findOneAndUpdate(
        { name: voice.name },
        { name: voice.name, description: voice.description || '' },
        { upsert: true }  // Inserts if not exists
      );
    }

    const savedVoices = await Voice.find();
    res.json(savedVoices);  // Returns locally stored voices
  } catch (error) {
    logger.error(`Get Voices Error: ${error.message}`);
    next(new APIError('Failed to fetch voices', 500));
  }
};

// Downloads a call recording
exports.downloadRecording = async (req, res, next) => {
  const { callId } = req.params;
  try {
    const call = await Call.findOne({ _id: callId });
    if (!call) {
      throw new APIError('Call not found', 404);
    }
    res.redirect(call.record_URL);  // Redirects to recording URL
  } catch (error) {
    logger.error(`Download Recording Error: ${error.message}`);
    next(error);
  }
};

// Reports a call to Bland AI
exports.reportCall = async (req, res, next) => {
  const { callId } = req.params;
  const { reason } = req.body;  // Reason for reporting
  try {
    // *** BLAND AI INTEGRATION: Report call ***
    const response = await axios.post(blandConfig.endpoints.reportCall(callId), {
      reason: reason || 'Unspecified'
    }, { headers: blandConfig.headers });
    res.json({ success: true, message: 'Call reported successfully', data: response.data });
  } catch (error) {
    logger.error(`Report Call Error: ${error.message}`);
    next(new APIError('Failed to report call', 500));
  }
};

// Helper function to send email notifications
function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }  // Uses env variables
  });
  const mailOptions = { from: process.env.EMAIL_USER, to, subject, text };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) logger.error(`Email Error: ${error.message}`);
    else logger.info(`Email sent: ${info.response}`);
  });
}