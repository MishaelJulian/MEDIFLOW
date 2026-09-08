const appointmentService = require('../services/appointment.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const bookAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.bookAppointment(req.body, req.user);
  return sendSuccess(res, 201, 'Appointment booked successfully', appointment);
});

const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getAppointments(req.user, req.query);
  return sendSuccess(res, 200, 'Appointments retrieved successfully', appointments);
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.params.id, req.user);
  return sendSuccess(res, 200, 'Appointment retrieved successfully', appointment);
});

const confirmAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.confirmAppointment(req.params.id, req.user);
  return sendSuccess(res, 200, 'Appointment confirmed successfully', appointment);
});

const completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.completeAppointment(req.params.id, req.user);
  return sendSuccess(res, 200, 'Appointment completed successfully', appointment);
});

const markNoShow = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.markNoShow(req.params.id, req.user);
  return sendSuccess(res, 200, 'Appointment marked as no-show successfully', appointment);
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.cancelAppointment(req.params.id, req.body.reason, req.user);
  return sendSuccess(res, 200, 'Appointment cancelled successfully', appointment);
});

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  confirmAppointment,
  completeAppointment,
  markNoShow,
  cancelAppointment,
};
