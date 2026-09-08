const Patient = require('../models/Patient');
const User = require('../models/User');
const AppError = require('../errors/AppError');

class PatientService {
  /**
   * Get patient profile for the authenticated user
   */
  async getProfileByUserId(userId) {
    const patient = await Patient.findOne({ userId }).populate('userId', 'name email phone role isActive');
    if (!patient) {
      throw AppError.notFound('Patient profile not found', 'NOT_FOUND');
    }
    return patient;
  }

  /**
   * Update patient profile for the authenticated user
   */
  async updateProfileByUserId(userId, updateData) {
    const { name, phone, dob, gender, bloodGroup, address, medicalNotes } = updateData;

    // If name or phone is provided, update User document
    if (name || phone !== undefined) {
      const userUpdate = {};
      if (name) userUpdate.name = name;
      if (phone !== undefined) userUpdate.phone = phone;
      await User.findByIdAndUpdate(userId, userUpdate, { runValidators: true });
    }

    // Update Patient document
    const patientUpdate = {};
    if (dob !== undefined) patientUpdate.dob = dob;
    if (gender !== undefined) patientUpdate.gender = gender;
    if (bloodGroup !== undefined) patientUpdate.bloodGroup = bloodGroup;
    if (address !== undefined) patientUpdate.address = address;
    if (medicalNotes !== undefined) patientUpdate.medicalNotes = medicalNotes;

    const updatedPatient = await Patient.findOneAndUpdate(
      { userId },
      patientUpdate,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone role isActive');

    if (!updatedPatient) {
      throw AppError.notFound('Patient profile not found', 'NOT_FOUND');
    }

    return updatedPatient;
  }
}

module.exports = new PatientService();
