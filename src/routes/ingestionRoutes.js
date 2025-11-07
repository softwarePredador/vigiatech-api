const express = require('express');
const ingestionController = require('../controllers/ingestionController');

const router = express.Router();

// Route for IoT devices to send vibration data
// Note: This could be secured with API key authentication in production
router.post('/vibration', ingestionController.ingestVibration);

module.exports = router;
