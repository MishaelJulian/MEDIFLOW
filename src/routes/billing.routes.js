const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createInvoiceValidator,
  payInvoiceValidator,
  updateInvoiceStatusValidator,
  invoiceIdParamValidator,
  listInvoicesQueryValidator,
} = require('../validators/billing.validators');

// All billing endpoints require authentication
router.use(authenticate);

// Patient endpoints
router.get('/my-invoices', authorize('PATIENT'), billingController.getMyInvoices);
router.post('/:id/pay', authorize('PATIENT', 'RECEPTIONIST', 'ADMIN'), payInvoiceValidator, validate, billingController.payInvoice);

// General/authorized retrieval
router.get('/:id', authorize('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN'), invoiceIdParamValidator, validate, billingController.getInvoiceById);

// Administrative / Operational endpoints
router.post('/', authorize('DOCTOR', 'RECEPTIONIST', 'ADMIN'), createInvoiceValidator, validate, billingController.createInvoice);
router.patch('/:id/status', authorize('RECEPTIONIST', 'ADMIN'), updateInvoiceStatusValidator, validate, billingController.updateInvoiceStatus);
router.get('/', authorize('RECEPTIONIST', 'ADMIN'), listInvoicesQueryValidator, validate, billingController.getAllInvoices);

module.exports = router;

