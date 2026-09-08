const departmentService = require('../services/department.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.body);
  return sendSuccess(res, 201, 'Department created successfully', department);
});

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.getDepartments(req.query);
  return sendSuccess(res, 200, 'Departments retrieved successfully', departments);
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);
  return sendSuccess(res, 200, 'Department retrieved successfully', department);
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(req.params.id, req.body);
  return sendSuccess(res, 200, 'Department updated successfully', department);
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.deleteDepartment(req.params.id);
  return sendSuccess(res, 200, 'Department deactivated successfully', department);
});

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
