const { body } = require('express-validator');

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('phone')
    .optional()
    .trim(),
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED'])
    .withMessage('Invalid gender option'),
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'])
    .withMessage('Invalid blood group'),
  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),
  body('address.street')
    .optional()
    .trim(),
  body('address.city')
    .optional()
    .trim(),
  body('address.state')
    .optional()
    .trim(),
  body('address.zipCode')
    .optional()
    .trim(),
  body('medicalNotes')
    .optional()
    .trim(),
];

module.exports = {
  updateProfileValidator,
};
