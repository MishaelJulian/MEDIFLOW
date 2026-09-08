const availabilityService = require('../services/availability.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const setAvailability = asyncHandler(async (req, res) => {
  const availability = await availabilityService.setAvailability(req.params.id, req.body, req.user);
  return sendSuccess(res, 201, 'Availability schedule added successfully', availability);
});

const getDoctorAvailability = asyncHandler(async (req, res) => {
  const availabilities = await availabilityService.getDoctorAvailability(req.params.id, req.query.date);
  return sendSuccess(res, 200, 'Doctor availability retrieved successfully', availabilities);
});

const getAvailableSlots = asyncHandler(async (req, res) => {
  const result = await availabilityService.getAvailableSlots(req.params.id, req.query.date);
  return sendSuccess(res, 200, 'Available slots calculated successfully', result);
});

module.exports = {
  setAvailability,
  getDoctorAvailability,
  getAvailableSlots,
};
