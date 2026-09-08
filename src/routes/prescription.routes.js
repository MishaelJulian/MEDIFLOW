const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createPrescriptionValidator,
  prescriptionIdParamValidator,
  appointmentIdParamValidator,
} = require('../validators/prescription.validators');

// All prescription routes require authentication
router.use(authenticate);

// Create prescription (Doctor only)
router.post(
  '/',
  authorize('DOCTOR'),
  createPrescriptionValidator,
  validate,
  prescriptionController.createPrescription
);

// List prescriptions (Role-scoped)
router.get('/', prescriptionController.getPrescriptions);

// Get prescription for a specific appointment
router.get(
  '/appointment/:appointmentId',
  appointmentIdParamValidator,
  validate,
  prescriptionController.getPrescriptionByAppointment
);

// Get single prescription by ID
router.get(
  '/:id',
  prescriptionIdParamValidator,
  validate,
  prescriptionController.getPrescriptionById
);

module.exports = router;
