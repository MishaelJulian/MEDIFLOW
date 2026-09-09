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

router.get(
  '/admin-dashboard',
  authorize('ADMIN', 'RECEPTIONIST'),
  analyticsController.getDashboardSummary
);

// Comprehensive Operational Reports (Admin)
router.get(
  '/reports',
  authorize('ADMIN'),
  analyticsController.getReports
);

// Doctor Dashboard (Doctor only)
router.get(
  '/doctor-dashboard',
  authorize('DOCTOR'),
  analyticsController.getDoctorDashboard
);

// Patient Dashboard (Patient only)
router.get(
  '/patient-dashboard',
  authorize('PATIENT'),
  analyticsController.getPatientDashboard
);

module.exports = router;
