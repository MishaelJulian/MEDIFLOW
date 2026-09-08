const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const AppError = require('../errors/AppError');
const notificationService = require('./notification.service');

class PrescriptionService {
  /**
   * Create a new prescription (Doctor only)
   */
  async createPrescription(prescriptionData, requestingUser) {
    const { appointmentId, diagnosis, items, notes } = prescriptionData;

    // 1. Verify requesting user is a DOCTOR
    const doctor = await Doctor.findOne({ userId: requestingUser._id });
    if (!doctor) {
      throw AppError.forbidden('Only registered doctors can create prescriptions', 'FORBIDDEN');
    }

    // 2. Fetch and validate appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId')
      .populate('doctorId');

    if (!appointment) {
      throw AppError.notFound(`Appointment not found with ID: ${appointmentId}`, 'NOT_FOUND');
    }

    // 3. Verify doctor is the one assigned to this appointment
    if (appointment.doctorId._id.toString() !== doctor._id.toString()) {
      throw AppError.forbidden('You can only create prescriptions for your assigned appointments', 'FORBIDDEN');
    }

    // 4. Verify appointment is not cancelled or marked no-show
    if (['CANCELLED', 'NO_SHOW'].includes(appointment.status)) {
      throw AppError.badRequest(
        `Cannot create prescription for appointment with status '${appointment.status}'`,
        'BUSINESS_RULE_VIOLATION'
      );
    }

    // 5. Verify prescription does not already exist for this appointment
    const existingPrescription = await Prescription.findOne({ appointmentId });
    if (existingPrescription) {
      throw AppError.conflict(
        'A prescription has already been created for this appointment',
        'DUPLICATE_PRESCRIPTION'
      );
    }

    // 6. Validate prescription items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest('Prescription must contain at least one medicine item', 'VALIDATION_ERROR');
    }

    for (const item of items) {
      if (!item.medicine || !item.dosage || !item.frequency || !item.duration) {
        throw AppError.badRequest(
          'Each prescription item must include medicine, dosage, frequency, and duration',
          'VALIDATION_ERROR'
        );
      }
    }

    // 7. Create prescription
    const prescription = new Prescription({
      appointmentId: appointment._id,
      doctorId: doctor._id,
      patientId: appointment.patientId._id,
      diagnosis: diagnosis ? diagnosis.trim() : '',
      items: items.map((item) => ({
        medicine: item.medicine.trim(),
        dosage: item.dosage.trim(),
        frequency: item.frequency.trim(),
        duration: item.duration.trim(),
        instructions: item.instructions ? item.instructions.trim() : '',
      })),
      notes: notes ? notes.trim() : '',
    });

    await prescription.save();

    // 8. Generate notification for patient
    if (appointment.patientId && appointment.patientId.userId) {
      await notificationService.createNotification({
        recipient: appointment.patientId.userId,
        type: 'PRESCRIPTION_AVAILABLE',
        message: `A new digital prescription is available for your consultation on ${appointment.date}.`,
        relatedEntity: {
          entityType: 'Prescription',
          entityId: prescription._id,
        },
      });
    }

    return await this.getPrescriptionById(prescription._id, requestingUser);
  }

  /**
   * Get prescription by ID with RBAC check
   */
  async getPrescriptionById(prescriptionId, requestingUser) {
    const prescription = await Prescription.findById(prescriptionId)
      .populate({
        path: 'appointmentId',
        select: 'date startTime endTime status departmentId reason',
        populate: { path: 'departmentId', select: 'name description' },
      })
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' },
        ],
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    if (!prescription) {
      throw AppError.notFound(`Prescription not found with ID: ${prescriptionId}`, 'NOT_FOUND');
    }

    // Role-based authorization
    if (requestingUser.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: requestingUser._id });
      if (!patient || prescription.patientId._id.toString() !== patient._id.toString()) {
        throw AppError.forbidden('You are not authorized to view this prescription', 'FORBIDDEN');
      }
    } else if (requestingUser.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: requestingUser._id });
      if (!doctor || prescription.doctorId._id.toString() !== doctor._id.toString()) {
        throw AppError.forbidden('You are not authorized to view this prescription', 'FORBIDDEN');
      }
    }

    return prescription;
  }

  /**
   * Get prescription by Appointment ID
   */
  async getPrescriptionByAppointment(appointmentId, requestingUser) {
    const prescription = await Prescription.findOne({ appointmentId })
      .populate({
        path: 'appointmentId',
        select: 'date startTime endTime status departmentId reason',
        populate: { path: 'departmentId', select: 'name description' },
      })
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' },
        ],
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    if (!prescription) {
      throw AppError.notFound(`No prescription found for appointment ID: ${appointmentId}`, 'NOT_FOUND');
    }

    // Role check
    if (requestingUser.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: requestingUser._id });
      if (!patient || prescription.patientId._id.toString() !== patient._id.toString()) {
        throw AppError.forbidden('You are not authorized to view this prescription', 'FORBIDDEN');
      }
    } else if (requestingUser.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: requestingUser._id });
      if (!doctor || prescription.doctorId._id.toString() !== doctor._id.toString()) {
        throw AppError.forbidden('You are not authorized to view this prescription', 'FORBIDDEN');
      }
    }

    return prescription;
  }

  /**
   * List prescriptions (Role-scoped)
   */
  async getPrescriptions(requestingUser, filters = {}) {
    const query = {};

    if (requestingUser.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: requestingUser._id });
      if (!patient) return [];
      query.patientId = patient._id;
    } else if (requestingUser.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: requestingUser._id });
      if (!doctor) return [];
      query.doctorId = doctor._id;
    } else if (['ADMIN', 'RECEPTIONIST'].includes(requestingUser.role)) {
      if (filters.patientId) query.patientId = filters.patientId;
      if (filters.doctorId) query.doctorId = filters.doctorId;
    }

    return await Prescription.find(query)
      .populate({
        path: 'appointmentId',
        select: 'date startTime endTime status departmentId reason',
        populate: { path: 'departmentId', select: 'name' },
      })
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' },
        ],
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .sort({ createdAt: -1 });
  }
}

module.exports = new PrescriptionService();
