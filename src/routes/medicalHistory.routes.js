const express = require('express');
const router = express.Router();
const medicalHistoryController = require('../controllers/medicalHistory.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All medical history routes require authentication
router.use(authenticate);

// Get authenticated patient's own medical history
router.get('/me', medicalHistoryController.getMyMedicalHistory);

// Get specific patient's medical history (Doctor, Admin, Receptionist or self)
router.get('/:id', medicalHistoryController.getPatientMedicalHistory);

module.exports = router;
