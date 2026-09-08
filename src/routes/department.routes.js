const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createDepartmentValidator,
  updateDepartmentValidator,
  departmentIdParamValidator,
} = require('../validators/department.validators');

// Public / Authenticated read routes
router.get('/', departmentController.getDepartments);
router.get('/:id', departmentIdParamValidator, validate, departmentController.getDepartmentById);

// Admin-only write routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  createDepartmentValidator,
  validate,
  departmentController.createDepartment
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  updateDepartmentValidator,
  validate,
  departmentController.updateDepartment
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  departmentIdParamValidator,
  validate,
  departmentController.deleteDepartment
);

module.exports = router;
