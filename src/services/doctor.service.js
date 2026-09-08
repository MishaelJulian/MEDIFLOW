const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Department = require('../models/Department');
const AppError = require('../errors/AppError');

class DoctorService {
  /**
   * Create/Register Doctor profile linked to an existing User
   */
  async createDoctor(doctorData) {
    const { userId, departmentId, specialization, qualifications, experienceYears, consultationFee, bio } = doctorData;

    // Verify User exists and has DOCTOR role
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('Linked User account not found', 'NOT_FOUND');
    }

    if (user.role !== 'DOCTOR') {
      throw AppError.badRequest(
        `User account must have DOCTOR role to be linked as a doctor. Current role: ${user.role}`,
        'BUSINESS_RULE_VIOLATION'
      );
    }

    // Check if Doctor profile already exists for this User
    const existingDoctor = await Doctor.findOne({ userId });
    if (existingDoctor) {
      throw AppError.conflict('A doctor profile already exists for this user', 'DUPLICATE_RESOURCE');
    }

    // Verify Department exists and is active
    const department = await Department.findById(departmentId);
    if (!department) {
      throw AppError.notFound('Department not found', 'NOT_FOUND');
    }

    if (!department.isActive) {
      throw AppError.badRequest('Cannot assign doctor to an inactive department', 'BUSINESS_RULE_VIOLATION');
    }

    const doctor = new Doctor({
      userId,
      departmentId,
      specialization: specialization.trim(),
      qualifications: qualifications || [],
      experienceYears: experienceYears || 0,
      consultationFee: consultationFee || 0,
      bio: bio ? bio.trim() : '',
      isActive: true,
    });

    await doctor.save();
    return await doctor.populate([
      { path: 'userId', select: 'name email phone role isActive' },
      { path: 'departmentId', select: 'name description isActive' },
    ]);
  }

  /**
   * Get all doctors with filtering
   */
  async getDoctors(filters = {}) {
    const query = {};

    if (filters.department) {
      // Find department by id or name
      const dept = await Department.findOne({
        $or: [
          { _id: filters.department.match(/^[0-9a-fA-F]{24}$/) ? filters.department : null },
          { name: { $regex: new RegExp(`^${filters.department}$`, 'i') } },
        ],
      });
      if (dept) {
        query.departmentId = dept._id;
      } else {
        // No department matched
        return [];
      }
    }

    if (filters.specialization) {
      query.specialization = { $regex: new RegExp(filters.specialization, 'i') };
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    return await Doctor.find(query)
      .populate('userId', 'name email phone role isActive')
      .populate('departmentId', 'name description isActive')
      .sort({ createdAt: -1 });
  }

  /**
   * Get doctor by ID
   */
  async getDoctorById(doctorId) {
    const doctor = await Doctor.findById(doctorId)
      .populate('userId', 'name email phone role isActive')
      .populate('departmentId', 'name description isActive');

    if (!doctor) {
      throw AppError.notFound(`Doctor not found with ID: ${doctorId}`, 'NOT_FOUND');
    }

    return doctor;
  }

  /**
   * Update doctor profile
   */
  async updateDoctor(doctorId, updateData, requestingUser) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw AppError.notFound(`Doctor not found with ID: ${doctorId}`, 'NOT_FOUND');
    }

    // Role check: Admin can update anything. Doctor can update own profile (not active status or department)
    if (requestingUser.role === 'DOCTOR') {
      if (doctor.userId.toString() !== requestingUser._id.toString()) {
        throw AppError.forbidden('You can only update your own doctor profile', 'FORBIDDEN');
      }
      // Doctors cannot change their own department or active state
      delete updateData.departmentId;
      delete updateData.isActive;
      delete updateData.userId;
    }

    if (updateData.departmentId) {
      const department = await Department.findById(updateData.departmentId);
      if (!department || !department.isActive) {
        throw AppError.badRequest('Invalid or inactive department', 'BUSINESS_RULE_VIOLATION');
      }
      doctor.departmentId = updateData.departmentId;
    }

    if (updateData.specialization) doctor.specialization = updateData.specialization.trim();
    if (updateData.qualifications) doctor.qualifications = updateData.qualifications;
    if (updateData.experienceYears !== undefined) doctor.experienceYears = updateData.experienceYears;
    if (updateData.consultationFee !== undefined) doctor.consultationFee = updateData.consultationFee;
    if (updateData.bio !== undefined) doctor.bio = updateData.bio.trim();
    if (updateData.isActive !== undefined && requestingUser.role === 'ADMIN') {
      doctor.isActive = updateData.isActive;
    }

    await doctor.save();
    return await doctor.populate([
      { path: 'userId', select: 'name email phone role isActive' },
      { path: 'departmentId', select: 'name description isActive' },
    ]);
  }
}

module.exports = new DoctorService();
