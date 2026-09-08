const patientService = require('../services/patient.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await patientService.getProfileByUserId(req.user._id);
  return sendSuccess(res, 200, 'Patient profile retrieved successfully', profile);
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const updatedProfile = await patientService.updateProfileByUserId(req.user._id, req.body);
  return sendSuccess(res, 200, 'Patient profile updated successfully', updatedProfile);
});

module.exports = {
  getMyProfile,
  updateMyProfile,
};
