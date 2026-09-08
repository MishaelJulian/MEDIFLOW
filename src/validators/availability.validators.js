const { body, param, query } = require('express-validator');

const createAvailabilityValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Doctor ID format'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
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
  body('slotDuration')
    .optional()
    .isInt({ min: 5, max: 120 })
    .withMessage('Slot duration must be between 5 and 120 minutes'),
];

const getAvailabilityQueryValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Doctor ID format'),
  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
];

const getAvailableSlotsQueryValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Doctor ID format'),
  query('date')
    .notEmpty()
    .withMessage('Date query parameter is required (YYYY-MM-DD)')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
];

module.exports = {
  createAvailabilityValidator,
  getAvailabilityQueryValidator,
  getAvailableSlotsQueryValidator,
};
