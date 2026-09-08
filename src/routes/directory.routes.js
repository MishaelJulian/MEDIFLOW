const express = require('express');
const router = express.Router();
const directoryController = require('../controllers/directory.controller');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  doctorDirectoryQueryValidator,
  patientDirectoryQueryValidator,
} = require('../validators/directory.validators');

// Doctor directory (open to all authenticated or public)
router.get(
  '/doctors',
  doctorDirectoryQueryValidator,
  validate,
  directoryController.getDoctorDirectory
);

// Department directory
router.get('/departments', directoryController.getDepartmentDirectory);

// Patient directory (Protected - Admin, Receptionist, Doctor only; Patients blocked)
router.get(
  '/patients',
  authenticate,
  patientDirectoryQueryValidator,
  validate,
  directoryController.getPatientDirectory
);

module.exports = router;
