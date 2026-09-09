const { body, param, query } = require('express-validator');

const setUserStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID format'),
  body('isActive')
    .notEmpty()
    .withMessage('isActive boolean is required')
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

const updateUserRoleValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID format'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['PATIENT', 'DOCTOR', 'ADMIN', 'RECEPTIONIST'])
    .withMessage('Invalid role specified'),
];

const listUsersQueryValidator = [
  query('role')
    .optional()
    .isIn(['PATIENT', 'DOCTOR', 'ADMIN', 'RECEPTIONIST'])
    .withMessage('Invalid role filter'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean string'),
  query('search')
    .optional()
    .trim(),
];

const adminAppointmentOverrideValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Appointment ID format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .withMessage('Invalid status specified'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

const userIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID format'),
];

module.exports = {
  setUserStatusValidator,
  updateUserRoleValidator,
  listUsersQueryValidator,
  adminAppointmentOverrideValidator,
  userIdParamValidator,
};
