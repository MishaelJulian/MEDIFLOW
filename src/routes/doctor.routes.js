const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const availabilityController = require('../controllers/availability.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createDoctorValidator,
  updateDoctorValidator,
  doctorIdParamValidator,
  listDoctorsQueryValidator,
} = require('../validators/doctor.validators');
const {
  createAvailabilityValidator,
  getAvailabilityQueryValidator,
  getAvailableSlotsQueryValidator,
} = require('../validators/availability.validators');

// Public / Authenticated read routes
router.get('/', listDoctorsQueryValidator, validate, doctorController.getDoctors);
router.get('/:id', doctorIdParamValidator, validate, doctorController.getDoctorById);

// Availability routes under /doctors/:id/availability
router.get(
  '/:id/availability',
  getAvailabilityQueryValidator,
  validate,
  availabilityController.getDoctorAvailability
);

router.get(
  '/:id/available-slots',
  getAvailableSlotsQueryValidator,
  validate,
  availabilityController.getAvailableSlots
);

router.post(
  '/:id/availability',
  authenticate,
  authorize('DOCTOR', 'ADMIN'),
  createAvailabilityValidator,
  validate,
  availabilityController.setAvailability
);

// Admin / Doctor write routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  createDoctorValidator,
  validate,
  doctorController.createDoctor
);

router.patch(
  '/:id',
  authenticate,
  authorize('DOCTOR', 'ADMIN'),
  updateDoctorValidator,
  validate,
  doctorController.updateDoctor
);

module.exports = router;
