const analyticsService = require('../services/analytics.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getNoShowRisk = asyncHandler(async (req, res) => {
  const result = await analyticsService.predictAppointmentNoShowRisk(req.params.appointmentId);
  return sendSuccess(res, 200, 'Appointment no-show risk assessment computed successfully', result);
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await analyticsService.getHospitalDashboardSummary();
  return sendSuccess(res, 200, 'Hospital operational analytics retrieved successfully', summary);
});

const getReports = asyncHandler(async (req, res) => {
  const reports = await analyticsService.getOperationalReports(req.query);
  return sendSuccess(res, 200, 'Operational reports generated successfully', reports);
});

const getDoctorDashboard = asyncHandler(async (req, res) => {
  const summary = await analyticsService.getDoctorDashboardSummary(req.user._id);
  return sendSuccess(res, 200, 'Doctor operational dashboard retrieved successfully', summary);
});

const getPatientDashboard = asyncHandler(async (req, res) => {
  const summary = await analyticsService.getPatientDashboardSummary(req.user._id);
  return sendSuccess(res, 200, 'Patient operational dashboard retrieved successfully', summary);
});

module.exports = {
  getNoShowRisk,
  getDashboardSummary,
  getReports,
  getDoctorDashboard,
  getPatientDashboard,
};

