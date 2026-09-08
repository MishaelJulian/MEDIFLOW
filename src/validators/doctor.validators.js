const { body, param, query } = require('express-validator');

const createDoctorValidator = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid User ID format'),
  body('departmentId')
    .notEmpty()
    .withMessage('Department ID is required')
    .isMongoId()
    .withMessage('Invalid Department ID format'),
  body('specialization')
    .trim()
    .notEmpty()
    .withMessage('Specialization is required')
    .isLength({ max: 100 })
    .withMessage('Specialization cannot exceed 100 characters'),
  body('qualifications')
    .optional()
    .isArray()
    .withMessage('Qualifications must be an array of strings'),
  body('experienceYears')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience years must be a non-negative integer'),
  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a non-negative number'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),
];

const updateDoctorValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Doctor ID format'),
  body('departmentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Department ID format'),
  body('specialization')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Specialization cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Specialization cannot exceed 100 characters'),
  body('qualifications')
    .optional()
    .isArray()
    .withMessage('Qualifications must be an array of strings'),
  body('experienceYears')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience years must be a non-negative integer'),
  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a non-negative number'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

const doctorIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Doctor ID format'),
];

const listDoctorsQueryValidator = [
  query('department')
    .optional()
    .trim(),
  query('specialization')
    .optional()
    .trim(),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive filter must be boolean'),
];

module.exports = {
  createDoctorValidator,
  updateDoctorValidator,
  doctorIdParamValidator,
  listDoctorsQueryValidator,
};
