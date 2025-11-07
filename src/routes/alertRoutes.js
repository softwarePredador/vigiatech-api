const express = require('express');
const alertController = require('../controllers/alertController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', alertController.list);
router.get('/:id', alertController.get);
router.put('/:id/resolve', alertController.resolve);
router.get('/machine/:machineId', alertController.getMachineAlerts);

module.exports = router;
