const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const DoctorAvailability = require('../models/DoctorAvailability');
const AppError = require('../errors/AppError');
const {
  timeToMinutes,
  isIntervalOverlapping,
  isIntervalWithin,
  isFutureDateTime,
} = require('../utils/timeUtils');

class AppointmentService {
  /**
   * Book an Appointment
   */
  async bookAppointment(appointmentData, requestingUser) {
    const { doctorId, date, startTime, endTime, reason } = appointmentData;

    // 1. Resolve Patient ID based on authenticated user
    let patientId;
    if (requestingUser.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: requestingUser._id });
      if (!patient) {
        throw AppError.notFound('Patient profile not found for this user', 'NOT_FOUND');
      }
      patientId = patient._id;
    } else if (['ADMIN', 'RECEPTIONIST'].includes(requestingUser.role)) {
      // Admin/Receptionist can book for a patient if patientId provided
      if (!appointmentData.patientId) {
        throw AppError.badRequest('Patient ID is required for administrative booking', 'VALIDATION_ERROR');
      }
      const patient = await Patient.findById(appointmentData.patientId);
      if (!patient) {
        throw AppError.notFound('Patient not found', 'NOT_FOUND');
      }
      patientId = patient._id;
    } else {
      throw AppError.forbidden('Doctors cannot book appointments directly as patients', 'FORBIDDEN');
    }

    // 2. Validate start < end
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      throw AppError.badRequest(
        `Start time (${startTime}) must precede end time (${endTime})`,
        'BUSINESS_RULE_VIOLATION'
      );
    }

    // 3. Validate doctor exists and is active
    const doctor = await Doctor.findById(doctorId).populate('departmentId');
    if (!doctor) {
      throw AppError.notFound(`Doctor not found with ID: ${doctorId}`, 'NOT_FOUND');
    }

    if (!doctor.isActive) {
      throw AppError.badRequest('Cannot book appointment with an inactive doctor', 'BUSINESS_RULE_VIOLATION');
    }

    if (!doctor.departmentId || !doctor.departmentId.isActive) {
      throw AppError.badRequest('Cannot book appointment in an inactive department', 'BUSINESS_RULE_VIOLATION');
    }

    // 4. Verify slot is in the future
    if (!isFutureDateTime(date, startTime)) {
      throw AppError.badRequest(
        `Appointment time must be in the future. Given: ${date} ${startTime}`,
        'BUSINESS_RULE_VIOLATION'
      );
    }

    // 5. Verify slot lies completely within doctor's active availability windows for that date
    const availabilities = await DoctorAvailability.find({
      doctorId,
      date,
      isActive: true,
    });

    if (!availabilities.length) {
      throw AppError.badRequest(
        `Doctor is not available on ${date}. No availability schedule found.`,
        'BUSINESS_RULE_VIOLATION'
      );
    }

    const isWithinAnyAvailability = availabilities.some((avail) =>
      isIntervalWithin(startTime, endTime, avail.startTime, avail.endTime)
    );

    if (!isWithinAnyAvailability) {
      throw AppError.badRequest(
        `Requested slot (${startTime} - ${endTime}) is outside doctor's configured availability on ${date}`,
        'BUSINESS_RULE_VIOLATION'
      );
    }

    // 6. Check for conflicting doctor appointments (A.start < B.end AND B.start < A.end)
    const existingDoctorAppointments = await Appointment.find({
      doctorId,
      date,
      status: { $in: ['BOOKED', 'CONFIRMED', 'COMPLETED'] },
    });

    for (const existing of existingDoctorAppointments) {
      if (isIntervalOverlapping(startTime, endTime, existing.startTime, existing.endTime)) {
        throw AppError.conflict(
          `Doctor already has a booked appointment between ${existing.startTime} and ${existing.endTime} on ${date}`,
          'SLOT_CONFLICT'
        );
      }
    }

    // 7. Check for conflicting patient appointments on the same date/time
    const existingPatientAppointments = await Appointment.find({
      patientId,
      date,
      status: { $in: ['BOOKED', 'CONFIRMED', 'COMPLETED'] },
    });

    for (const existing of existingPatientAppointments) {
      if (isIntervalOverlapping(startTime, endTime, existing.startTime, existing.endTime)) {
        throw AppError.conflict(
          `You already have another active appointment between ${existing.startTime} and ${existing.endTime} on ${date}`,
          'SLOT_CONFLICT'
        );
      }
    }

    // 8. Create appointment with unique slotKey for concurrency race condition protection
    const slotKey = `${doctorId}_${date}_${startTime}`;

    try {
      const appointment = new Appointment({
        patientId,
        doctorId,
        departmentId: doctor.departmentId._id,
        date,
        startTime,
        endTime,
        status: 'BOOKED',
        reason: reason ? reason.trim() : '',
        slotKey,
      });

      await appointment.save();

      return await appointment.populate([
        {
          path: 'patientId',
          populate: { path: 'userId', select: 'name email phone' },
        },
        {
          path: 'doctorId',
          populate: [
            { path: 'userId', select: 'name email phone' },
            { path: 'departmentId', select: 'name description' },
          ],
        },
        { path: 'departmentId', select: 'name description' },
      ]);
    } catch (err) {
      if (err.code === 11000) {
        throw AppError.conflict(
          'This appointment slot was just booked by another request. Please choose a different slot.',
          'SLOT_CONFLICT'
        );
      }
      throw err;
    }
  }

  /**
   * Get appointments list based on user role and query filters
   */
  async getAppointments(requestingUser, filters = {}) {
    const query = {};

    // Role-based data access scope
    if (requestingUser.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: requestingUser._id });
      if (!patient) return [];
      query.patientId = patient._id;
    } else if (requestingUser.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: requestingUser._id });
      if (!doctor) return [];
      query.doctorId = doctor._id;
    } else if (['ADMIN', 'RECEPTIONIST'].includes(requestingUser.role)) {
      if (filters.doctorId) query.doctorId = filters.doctorId;
      if (filters.patientId) query.patientId = filters.patientId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.date) {
      query.date = filters.date;
    }

    return await Appointment.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name description' },
        ],
      })
      .populate('departmentId', 'name description')
      .sort({ date: -1, startTime: -1 });
  }

  /**
   * Get appointment by ID with role check
   */
  async getAppointmentById(appointmentId, requestingUser) {
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name description' },
        ],
      })
      .populate('departmentId', 'name description');

    if (!appointment) {
      throw AppError.notFound(`Appointment not found with ID: ${appointmentId}`, 'NOT_FOUND');
    }

    // Role verification
    if (requestingUser.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: requestingUser._id });
      if (!patient || appointment.patientId._id.toString() !== patient._id.toString()) {
        throw AppError.forbidden('You are not authorized to view this appointment', 'FORBIDDEN');
      }
    } else if (requestingUser.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: requestingUser._id });
      if (!doctor || appointment.doctorId._id.toString() !== doctor._id.toString()) {
        throw AppError.forbidden('You are not authorized to view this appointment', 'FORBIDDEN');
      }
    }

    return appointment;
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId, reason, requestingUser) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw AppError.notFound(`Appointment not found with ID: ${appointmentId}`, 'NOT_FOUND');
    }

    // Verify ownership
    if (requestingUser.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: requestingUser._id });
      if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
        throw AppError.forbidden('You can only cancel your own appointments', 'FORBIDDEN');
      }
    } else if (requestingUser.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: requestingUser._id });
      if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        throw AppError.forbidden('You can only cancel appointments assigned to you', 'FORBIDDEN');
      }
    }

    // State machine check: only BOOKED or CONFIRMED appointments can be CANCELLED
    if (!['BOOKED', 'CONFIRMED'].includes(appointment.status)) {
      throw AppError.badRequest(
        `Cannot cancel an appointment with status '${appointment.status}'. Allowed statuses: BOOKED, CONFIRMED`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    appointment.status = 'CANCELLED';
    appointment.cancelledReason = reason ? reason.trim() : 'Cancelled by user';
    // Clear slotKey so slot is freed up for future bookings
    appointment.slotKey = null;

    await appointment.save();

    return await appointment.populate([
      {
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      },
      {
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name description' },
        ],
      },
      { path: 'departmentId', select: 'name description' },
    ]);
  }
}

module.exports = new AppointmentService();
