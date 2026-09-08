const { body, param } = require('express-validator');

const createDepartmentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

const updateDepartmentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid department ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

const departmentIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid department ID format'),
];

module.exports = {
  createDepartmentValidator,
  updateDepartmentValidator,
  departmentIdParamValidator,
};
