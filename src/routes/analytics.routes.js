const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All analytics routes require authentication
router.use(authenticate);

// Appointment No-Show Risk Prediction (Operational: Admin, Receptionist, Doctor)
router.get(
  '/no-show-risk/:appointmentId',
  authorize('ADMIN', 'RECEPTIONIST', 'DOCTOR'),
  analyticsController.getNoShowRisk
);

// Hospital Operations & Dashboard Summary (Operational: Admin, Receptionist)
router.get(
  '/dashboard-summary',
  authorize('ADMIN', 'RECEPTIONIST'),
  analyticsController.getDashboardSummary
);

module.exports = router;
