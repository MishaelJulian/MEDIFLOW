const { query } = require('express-validator');

const doctorDirectoryQueryValidator = [
  query('departmentId')
    .optional()
    .isMongoId()
    .withMessage('Department ID must be a valid MongoDB ObjectId'),

  query('specialization')
    .optional()
    .isString()
    .withMessage('Specialization must be a string'),

  query('search')
    .optional()
    .isString()
    .withMessage('Search query must be a string'),

  query('activeOnly')
    .optional()
    .isBoolean()
    .withMessage('activeOnly must be a boolean (true/false)'),
];

const patientDirectoryQueryValidator = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search query must be a string'),

  query('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'])
    .withMessage('Invalid blood group filter'),
];

module.exports = {
  doctorDirectoryQueryValidator,
  patientDirectoryQueryValidator,
};
