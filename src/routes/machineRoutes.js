const express = require('express');
const machineController = require('../controllers/machineController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', machineController.list);
router.post('/', machineController.create);
router.get('/:id', machineController.get);
router.put('/:id', machineController.update);
router.delete('/:id', machineController.delete);
router.get('/:id/vibration-data', machineController.getVibrationData);

module.exports = router;
