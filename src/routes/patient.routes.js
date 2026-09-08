const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { updateProfileValidator } = require('../validators/patient.validators');

// Patient profile routes (Strictly for authenticated PATIENT)
router.get('/me', authenticate, authorize('PATIENT'), patientController.getMyProfile);
router.patch('/me', authenticate, authorize('PATIENT'), updateProfileValidator, validate, patientController.updateMyProfile);

module.exports = router;
