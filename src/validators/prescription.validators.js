const { body, param, query } = require('express-validator');

const createPrescriptionValidator = [
  body('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isMongoId()
    .withMessage('Appointment ID must be a valid MongoDB ObjectId'),

  body('diagnosis')
    .optional()
    .isString()
    .withMessage('Diagnosis must be a string')
    .isLength({ max: 500 })
    .withMessage('Diagnosis cannot exceed 500 characters'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('Prescription must contain an array with at least one medicine item'),

  body('items.*.medicine')
    .notEmpty()
    .withMessage('Medicine name is required for each item')
    .isString()
    .withMessage('Medicine name must be a string')
    .isLength({ max: 200 })
    .withMessage('Medicine name cannot exceed 200 characters'),

  body('items.*.dosage')
    .notEmpty()
    .withMessage('Dosage is required for each item (e.g., 500mg, 1 tablet)')
    .isString()
    .withMessage('Dosage must be a string')
    .isLength({ max: 100 })
    .withMessage('Dosage cannot exceed 100 characters'),

  body('items.*.frequency')
    .notEmpty()
    .withMessage('Frequency is required for each item (e.g., Twice daily, 1-0-1)')
    .isString()
    .withMessage('Frequency must be a string')
    .isLength({ max: 100 })
    .withMessage('Frequency cannot exceed 100 characters'),

  body('items.*.duration')
    .notEmpty()
    .withMessage('Duration is required for each item (e.g., 5 days, 2 weeks)')
    .isString()
    .withMessage('Duration must be a string')
    .isLength({ max: 100 })
    .withMessage('Duration cannot exceed 100 characters'),

  body('items.*.instructions')
    .optional()
    .isString()
    .withMessage('Instructions must be a string')
    .isLength({ max: 500 })
    .withMessage('Instructions cannot exceed 500 characters'),

  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

const prescriptionIdParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('Prescription ID is required')
    .isMongoId()
    .withMessage('Prescription ID must be a valid MongoDB ObjectId'),
];

const appointmentIdParamValidator = [
  param('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isMongoId()
    .withMessage('Appointment ID must be a valid MongoDB ObjectId'),
];

module.exports = {
  createPrescriptionValidator,
  prescriptionIdParamValidator,
  appointmentIdParamValidator,
};
