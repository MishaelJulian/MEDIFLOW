const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const AppError = require('../errors/AppError');

class MedicalHistoryService {
  /**
   * Retrieve historical clinical information for a patient
   */
  async getPatientMedicalHistory(patientId, requestingUser) {
    // 1. Fetch patient record
    const patient = await Patient.findById(patientId).populate('userId', 'name email phone');
    if (!patient) {
      throw AppError.notFound(`Patient not found with ID: ${patientId}`, 'NOT_FOUND');
    }

    // 2. Server-side Authorization Check
    if (requestingUser.role === 'PATIENT') {
      const selfPatient = await Patient.findOne({ userId: requestingUser._id });
      if (!selfPatient || selfPatient._id.toString() !== patient._id.toString()) {
        throw AppError.forbidden('You are not authorized to view this medical history', 'FORBIDDEN');
      }
    }

    // 3. Fetch all completed/relevant appointments for this patient
    const appointments = await Appointment.find({
      patientId: patient._id,
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

    // 4. Fetch all prescriptions for this patient
    const prescriptions = await Prescription.find({
      patientId: patient._id,
    })
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'departmentId', select: 'name' },
        ],
      })
      .sort({ createdAt: -1 });

    // Map prescriptions by appointmentId for easy aggregation
    const prescriptionMap = new Map();
    for (const rx of prescriptions) {
      prescriptionMap.set(rx.appointmentId.toString(), rx);
    }

    // 5. Structure clinical encounters timeline based on actual stored records
    const encounters = appointments.map((appt) => {
      const rx = prescriptionMap.get(appt._id.toString()) || null;
      return {
        appointmentId: appt._id,
        date: appt.date,
        time: `${appt.startTime} - ${appt.endTime}`,
        status: appt.status,
        department: appt.departmentId ? appt.departmentId.name : 'General',
        doctor: appt.doctorId && appt.doctorId.userId
          ? {
              doctorId: appt.doctorId._id,
              name: appt.doctorId.userId.name,
              specialization: appt.doctorId.specialization,
            }
          : null,
        reason: appt.reason || '',
        notes: appt.notes || '',
        cancelledReason: appt.cancelledReason || null,
        prescription: rx
          ? {
              prescriptionId: rx._id,
              diagnosis: rx.diagnosis,
              items: rx.items,
              notes: rx.notes,
              prescribedAt: rx.createdAt,
            }
          : null,
      };
    });

    // Summary statistics derived directly from stored records
    const totalAppointments = appointments.length;
    const completedConsultations = appointments.filter((a) => a.status === 'COMPLETED').length;
    const totalPrescriptions = prescriptions.length;

    return {
      patient: {
        id: patient._id,
        name: patient.userId ? patient.userId.name : 'Unknown',
        email: patient.userId ? patient.userId.email : '',
        phone: patient.userId ? patient.userId.phone : '',
        dob: patient.dob,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        address: patient.address,
        medicalNotes: patient.medicalNotes,
      },
      summary: {
        totalAppointments,
        completedConsultations,
        totalPrescriptions,
      },
      encounters,
      prescriptions,
    };
  }

  /**
   * Retrieve medical history for the currently authenticated patient
   */
  async getMyMedicalHistory(requestingUser) {
    if (requestingUser.role !== 'PATIENT') {
      throw AppError.badRequest('Only authenticated patients can use this endpoint directly', 'VALIDATION_ERROR');
    }

    const patient = await Patient.findOne({ userId: requestingUser._id });
    if (!patient) {
      throw AppError.notFound('Patient profile not found for this user', 'NOT_FOUND');
    }

    return await this.getPatientMedicalHistory(patient._id, requestingUser);
  }
}

module.exports = new MedicalHistoryService();
