const directoryService = require('../services/directory.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getDoctorDirectory = asyncHandler(async (req, res) => {
  const doctors = await directoryService.getDoctorDirectory(req.query);
  return sendSuccess(res, 200, 'Doctor directory retrieved successfully', doctors);
});

const getDepartmentDirectory = asyncHandler(async (req, res) => {
  const departments = await directoryService.getDepartmentDirectory();
  return sendSuccess(res, 200, 'Department directory retrieved successfully', departments);
});

const getPatientDirectory = asyncHandler(async (req, res) => {
  const patients = await directoryService.getPatientDirectory(req.user, req.query);
  return sendSuccess(res, 200, 'Patient directory retrieved successfully', patients);
});

module.exports = {
  getDoctorDirectory,
  getDepartmentDirectory,
  getPatientDirectory,
};
