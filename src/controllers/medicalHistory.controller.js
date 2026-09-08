const medicalHistoryService = require('../services/medicalHistory.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getMyMedicalHistory = asyncHandler(async (req, res) => {
  const history = await medicalHistoryService.getMyMedicalHistory(req.user);
  return sendSuccess(res, 200, 'Medical history retrieved successfully', history);
});

const getPatientMedicalHistory = asyncHandler(async (req, res) => {
  const history = await medicalHistoryService.getPatientMedicalHistory(req.params.id || req.params.patientId, req.user);
  return sendSuccess(res, 200, 'Patient medical history retrieved successfully', history);
});

module.exports = {
  getMyMedicalHistory,
  getPatientMedicalHistory,
};
