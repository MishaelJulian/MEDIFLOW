const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  setUserStatusValidator,
  updateUserRoleValidator,
  listUsersQueryValidator,
  adminAppointmentOverrideValidator,
  userIdParamValidator,
} = require('../validators/admin.validators');

// All admin routes strictly require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// User Management
router.get('/users', listUsersQueryValidator, validate, adminController.getAllUsers);
router.get('/users/:id', userIdParamValidator, validate, adminController.getUserById);
router.patch('/users/:id/status', setUserStatusValidator, validate, adminController.setUserStatus);
router.patch('/users/:id/role', updateUserRoleValidator, validate, adminController.updateUserRole);

// Appointment Oversight & Overrides
router.get('/appointments', adminController.getAllAppointmentsAdmin);
router.patch(
  '/appointments/:id/override',
  adminAppointmentOverrideValidator,
  validate,
  adminController.overrideAppointmentStatus
);

module.exports = router;
