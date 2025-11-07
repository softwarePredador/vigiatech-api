const express = require('express');
const ingestionController = require('../controllers/ingestionController');

const router = express.Router();

// Route for IoT devices to send vibration data
// SECURITY NOTE: In production, implement API key authentication or device registration
// to prevent unauthorized data submission. For development/testing, this is left open.
// Example production implementation:
//   router.use(apiKeyMiddleware);
router.post('/vibration', ingestionController.ingestVibration);

module.exports = router;
