const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All billing endpoints require authentication
router.use(authenticate);

// Patient endpoints
router.get('/my-invoices', authorize('PATIENT'), billingController.getMyInvoices);
router.post('/:id/pay', authorize('PATIENT', 'RECEPTIONIST', 'ADMIN'), billingController.payInvoice);

// General/authorized retrieval
router.get('/:id', authorize('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN'), billingController.getInvoiceById);

// Administrative / Operational endpoints
router.post('/', authorize('DOCTOR', 'RECEPTIONIST', 'ADMIN'), billingController.createInvoice);
router.get('/', authorize('RECEPTIONIST', 'ADMIN'), billingController.getAllInvoices);

module.exports = router;
