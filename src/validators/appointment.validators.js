const { body, param, query } = require('express-validator');

const createAppointmentValidator = [
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isMongoId()
    .withMessage('Invalid Doctor ID format'),
  body('date')
    .notEmpty()
    .withMessage('Appointment date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Start time must be in HH:MM (24h) format'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('End time must be in HH:MM (24h) format'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
];

const cancelAppointmentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Appointment ID format'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters'),
];

const appointmentIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Appointment ID format'),
];

const listAppointmentsQueryValidator = [
  query('status')
    .optional()
    .isIn(['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .withMessage('Invalid status filter'),
  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  query('doctorId')
    .optional()
    .isMongoId()
    .withMessage('Invalid doctor ID format'),
  query('patientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid patient ID format'),
];

module.exports = {
  createAppointmentValidator,
  cancelAppointmentValidator,
  appointmentIdParamValidator,
  listAppointmentsQueryValidator,
};
