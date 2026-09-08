const doctorService = require('../services/doctor.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.createDoctor(req.body);
  return sendSuccess(res, 201, 'Doctor profile created successfully', doctor);
});

const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorService.getDoctors(req.query);
  return sendSuccess(res, 200, 'Doctors retrieved successfully', doctors);
});

const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  return sendSuccess(res, 200, 'Doctor retrieved successfully', doctor);
});

const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateDoctor(req.params.id, req.body, req.user);
  return sendSuccess(res, 200, 'Doctor updated successfully', doctor);
});

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
};
