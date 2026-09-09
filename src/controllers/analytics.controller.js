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

module.exports = {
  getNoShowRisk,
  getDashboardSummary,
};
