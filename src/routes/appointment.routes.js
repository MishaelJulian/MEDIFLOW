const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createAppointmentValidator,
  cancelAppointmentValidator,
  appointmentIdParamValidator,
  listAppointmentsQueryValidator,
} = require('../validators/appointment.validators');

// All appointment routes are protected
router.use(authenticate);

// Book appointment
router.post(
  '/',
  createAppointmentValidator,
  validate,
  appointmentController.bookAppointment
);

// List appointments (role-scoped)
router.get(
  '/',
  listAppointmentsQueryValidator,
  validate,
  appointmentController.getAppointments
);

// Get appointment details
router.get(
  '/:id',
  appointmentIdParamValidator,
  validate,
  appointmentController.getAppointmentById
);

// Confirm appointment (BOOKED -> CONFIRMED)
router.patch(
  '/:id/confirm',
  appointmentIdParamValidator,
  validate,
  appointmentController.confirmAppointment
);

// Complete appointment (CONFIRMED -> COMPLETED)
router.patch(
  '/:id/complete',
  appointmentIdParamValidator,
  validate,
  appointmentController.completeAppointment
);

// Mark appointment as NO_SHOW (CONFIRMED -> NO_SHOW)
router.patch(
  '/:id/no-show',
  appointmentIdParamValidator,
  validate,
  appointmentController.markNoShow
);

// Cancel appointment
router.patch(
  '/:id/cancel',
  cancelAppointmentValidator,
  validate,
  appointmentController.cancelAppointment
);

module.exports = router;
