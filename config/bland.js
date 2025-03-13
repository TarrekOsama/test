// Configuration object for Bland AI API endpoints and headers
module.exports = {
    endpoints: {
      sendCall: 'https://api.bland.ai/v1/send-call',          // Initiates a new call
      analyzeCall: callId => `https://api.bland.ai/v1/calls/${callId}/analyze`,  // Analyzes a specific call
      callLogs: 'https://api.bland.ai/v1/call-logs',          // Retrieves call logs
      stopCall: callId => `https://api.bland.ai/v1/calls/${callId}/stop`,  // Stops an active call
      getTranscript: 'https://api.bland.ai/v1/transcript',    // Fetches call transcripts
      getVoices: 'https://api.bland.ai/v1/voices',            // Lists available voices
      reportCall: callId => `https://api.bland.ai/v1/calls/${callId}/report`  // Reports a call
    },
    headers: {
      'Authorization': `Bearer ${process.env.BLAND_API_KEY}`, // Authenticates requests with API key
      'Content-Type': 'application/json'                     // Specifies JSON request format
    }
  };