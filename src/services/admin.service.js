const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const AppError = require('../errors/AppError');

class AdminService {
  /**
   * Get all users with search, role, and active status filters
   */
  async getAllUsers(filters = {}) {
    const query = {};

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    return users;
  }

  /**
   * Get user by ID along with linked profile
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    let profile = null;
    if (user.role === 'DOCTOR') {
      profile = await Doctor.findOne({ userId: user._id }).populate('departmentId');
    } else if (user.role === 'PATIENT') {
      profile = await Patient.findOne({ userId: user._id });
    }

    return {
      user,
      profile,
    };
  }

  /**
   * Activate or deactivate a user account
   */
  async setUserStatus(userId, isActive, adminUser) {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (user._id.toString() === adminUser._id.toString() && !isActive) {
      throw AppError.badRequest('Administrators cannot deactivate their own account');
    }

    user.isActive = isActive;
    await user.save();

    // If doctor or patient, also sync active flag
    if (user.role === 'DOCTOR') {
      await Doctor.findOneAndUpdate({ userId: user._id }, { isActive });
    } else if (user.role === 'PATIENT') {
      await Patient.findOneAndUpdate({ userId: user._id }, { isActive });
    }

    return user;
  }

  /**
   * Update a user's role
   */
  async updateUserRole(userId, newRole, adminUser) {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (user._id.toString() === adminUser._id.toString() && newRole !== 'ADMIN') {
      throw AppError.badRequest('Administrators cannot demote themselves');
    }

    user.role = newRole;
    await user.save();
    return user;
  }

  /**
   * Admin appointment oversight with rich populated references
   */
  async getAllAppointmentsAdmin(filters = {}) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.date) {
      query.date = filters.date;
    }
    if (filters.doctorId) {
      query.doctorId = filters.doctorId;
    }
    if (filters.patientId) {
      query.patientId = filters.patientId;
    }
    if (filters.departmentId) {
      query.departmentId = filters.departmentId;
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate('departmentId', 'name description')
      .sort({ date: -1, startTime: -1 });

    return appointments;
  }

  /**
   * Administrative status override for an appointment
   */
  async overrideAppointmentStatus(appointmentId, { status, reason, notes }, adminUser) {
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' },
      });

    if (!appointment) {
      throw AppError.notFound('Appointment not found');
    }

    const previousStatus = appointment.status;
    appointment.status = status;
    if (reason) {
      appointment.cancellationReason = reason;
    }

    await appointment.save();

    // Notify patient
    try {
      if (appointment.patientId?.userId?._id) {
        const typeMap = {
          CANCELLED: 'APPOINTMENT_CANCELLED',
          COMPLETED: 'APPOINTMENT_COMPLETED',
          CONFIRMED: 'APPOINTMENT_CONFIRMED',
          NO_SHOW: 'APPOINTMENT_NO_SHOW',
        };
        const notifType = typeMap[status] || 'GENERAL';

        await Notification.create({
          recipient: appointment.patientId.userId._id,
          type: notifType,
          message: `Your appointment on ${appointment.date} at ${appointment.startTime} was administratively changed from ${previousStatus} to ${status}.${notes ? ` Note: ${notes}` : ''}`,
          relatedEntity: {
            entityType: 'Appointment',
            entityId: appointment._id,
          },
        });
      }
    } catch (err) {
      console.error('[AdminService] Notification error:', err.message);
    }

    return appointment;
  }
}

module.exports = new AdminService();
