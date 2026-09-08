const prescriptionService = require('../services/prescription.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const createPrescription = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.createPrescription(req.body, req.user);
  return sendSuccess(res, 201, 'Prescription created successfully', prescription);
});

const getPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await prescriptionService.getPrescriptions(req.user, req.query);
  return sendSuccess(res, 200, 'Prescriptions retrieved successfully', prescriptions);
});

const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.getPrescriptionById(req.params.id, req.user);
  return sendSuccess(res, 200, 'Prescription retrieved successfully', prescription);
});

const getPrescriptionByAppointment = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.getPrescriptionByAppointment(req.params.appointmentId, req.user);
  return sendSuccess(res, 200, 'Appointment prescription retrieved successfully', prescription);
});

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  getPrescriptionByAppointment,
};
