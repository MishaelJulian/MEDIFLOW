const adminService = require('../services/admin.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await adminService.getAllUsers(req.query);
  return sendSuccess(res, 200, 'Users retrieved successfully', users);
});

const getUserById = asyncHandler(async (req, res) => {
  const result = await adminService.getUserById(req.params.id);
  return sendSuccess(res, 200, 'User details retrieved successfully', result);
});

const setUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.setUserStatus(req.params.id, req.body.isActive, req.user);
  return sendSuccess(res, 200, `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`, user);
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserRole(req.params.id, req.body.role, req.user);
  return sendSuccess(res, 200, 'User role updated successfully', user);
});

const getAllAppointmentsAdmin = asyncHandler(async (req, res) => {
  const appointments = await adminService.getAllAppointmentsAdmin(req.query);
  return sendSuccess(res, 200, 'System appointments retrieved successfully', appointments);
});

const overrideAppointmentStatus = asyncHandler(async (req, res) => {
  const appointment = await adminService.overrideAppointmentStatus(req.params.id, req.body, req.user);
  return sendSuccess(res, 200, 'Appointment status administratively updated successfully', appointment);
});

module.exports = {
  getAllUsers,
  getUserById,
  setUserStatus,
  updateUserRole,
  getAllAppointmentsAdmin,
  overrideAppointmentStatus,
};
