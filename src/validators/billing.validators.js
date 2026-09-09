const { body, param, query } = require('express-validator');

const createInvoiceValidator = [
  body('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isMongoId()
    .withMessage('Invalid Appointment ID format'),
  body('lineItems')
    .optional()
    .isArray()
    .withMessage('Line items must be an array'),
  body('lineItems.*.description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Line item description cannot be empty'),
  body('lineItems.*.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Line item amount must be a positive number'),
  body('lineItems.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Line item quantity must be at least 1'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount cannot be negative'),
  body('tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax cannot be negative'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

const payInvoiceValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Invoice ID format'),
  body('paymentMethod')
    .optional()
    .isIn(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'INSURANCE', 'UPI', 'ONLINE_SIMULATION'])
    .withMessage('Invalid payment method'),
];

const updateInvoiceStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Invoice ID format'),
  body('paymentStatus')
    .notEmpty()
    .withMessage('Payment status is required')
    .isIn(['PENDING', 'PAID', 'FAILED', 'REFUNDED'])
    .withMessage('Invalid payment status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

const invoiceIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Invoice ID format'),
];

const listInvoicesQueryValidator = [
  query('paymentStatus')
    .optional()
    .isIn(['PENDING', 'PAID', 'FAILED', 'REFUNDED'])
    .withMessage('Invalid payment status filter'),
  query('patientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid patient ID format'),
  query('doctorId')
    .optional()
    .isMongoId()
    .withMessage('Invalid doctor ID format'),
];

module.exports = {
  createInvoiceValidator,
  payInvoiceValidator,
  updateInvoiceStatusValidator,
  invoiceIdParamValidator,
  listInvoicesQueryValidator,
};
