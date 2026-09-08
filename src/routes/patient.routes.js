const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const medicalHistoryController = require('../controllers/medicalHistory.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { updateProfileValidator } = require('../validators/patient.validators');

// Patient profile routes (Strictly for authenticated PATIENT)
router.get('/me', authenticate, authorize('PATIENT'), patientController.getMyProfile);
router.patch('/me', authenticate, authorize('PATIENT'), updateProfileValidator, validate, patientController.updateMyProfile);

// Medical history convenience endpoints
router.get('/me/medical-history', authenticate, authorize('PATIENT'), medicalHistoryController.getMyMedicalHistory);
router.get('/:id/medical-history', authenticate, medicalHistoryController.getPatientMedicalHistory);

module.exports = router;
