const DoctorAvailability = require('../models/DoctorAvailability');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const AppError = require('../errors/AppError');
const {
  timeToMinutes,
  isIntervalOverlapping,
  generateDiscreteSlots,
} = require('../utils/timeUtils');

class AvailabilityService {
  /**
   * Set availability window for a doctor
   */
  async setAvailability(doctorId, availabilityData, requestingUser) {
    const { date, startTime, endTime, slotDuration = 30 } = availabilityData;

    // Check doctor exists and is active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw AppError.notFound('Doctor not found', 'NOT_FOUND');
    }

    if (!doctor.isActive) {
      throw AppError.badRequest('Cannot configure availability for an inactive doctor', 'BUSINESS_RULE_VIOLATION');
    }

    // Ownership check: Doctor can only set own availability
    if (requestingUser.role === 'DOCTOR') {
      if (doctor.userId.toString() !== requestingUser._id.toString()) {
        throw AppError.forbidden('You are not authorized to modify availability for another doctor', 'FORBIDDEN');
      }
    }

    // Rule 1: Start time must precede end time
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      throw AppError.badRequest(
        `Start time (${startTime}) must be earlier than end time (${endTime})`,
        'BUSINESS_RULE_VIOLATION'
      );
    }

    // Rule 2: Check for overlapping availability windows for this doctor on the same date
    const existingAvailabilities = await DoctorAvailability.find({
      doctorId,
      date,
      isActive: true,
    });

    for (const existing of existingAvailabilities) {
      if (isIntervalOverlapping(startTime, endTime, existing.startTime, existing.endTime)) {
        throw AppError.conflict(
          `Availability window (${startTime} - ${endTime}) overlaps with existing window (${existing.startTime} - ${existing.endTime}) for date ${date}`,
          'SLOT_CONFLICT'
        );
      }
    }

    const availability = new DoctorAvailability({
      doctorId,
      date,
      startTime,
      endTime,
      slotDuration,
      isActive: true,
    });

    await availability.save();
    return availability;
  }

  /**
   * Get availability windows for a doctor
   */
  async getDoctorAvailability(doctorId, date = null) {
    const query = { doctorId, isActive: true };
    if (date) {
      query.date = date;
    }
    return await DoctorAvailability.find(query).sort({ date: 1, startTime: 1 });
  }

  /**
   * Get open bookable slots for a doctor on a specific date
   * Computes discrete slots and excludes existing active appointments
   */
  async getAvailableSlots(doctorId, date) {
    // 1. Check doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw AppError.notFound('Doctor not found', 'NOT_FOUND');
    }

    // 2. Fetch doctor availability windows for that date
    const availabilities = await DoctorAvailability.find({
      doctorId,
      date,
      isActive: true,
    });

    if (!availabilities.length) {
      return {
        doctorId,
        date,
        availableSlots: [],
        message: 'No availability scheduled for this date',
      };
    }

    // 3. Fetch active appointments for doctor on that date
    const bookedAppointments = await Appointment.find({
      doctorId,
      date,
      status: { $in: ['BOOKED', 'CONFIRMED', 'COMPLETED'] },
    });

    // 4. Generate all discrete slots across availability windows
    const allSlots = [];
    for (const avail of availabilities) {
      const slots = generateDiscreteSlots(avail.startTime, avail.endTime, avail.slotDuration || 30);
      allSlots.push(...slots);
    }

    // 5. Filter out slots that conflict with existing appointments
    const openSlots = allSlots.filter((slot) => {
      const isBooked = bookedAppointments.some((appt) =>
        isIntervalOverlapping(slot.startTime, slot.endTime, appt.startTime, appt.endTime)
      );
      return !isBooked;
    });

    return {
      doctorId,
      date,
      totalConfiguredSlots: allSlots.length,
      availableSlotsCount: openSlots.length,
      availableSlots: openSlots,
    };
  }
}

module.exports = new AvailabilityService();
