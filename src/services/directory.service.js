const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Patient = require('../models/Patient');
const DoctorAvailability = require('../models/DoctorAvailability');
const AppError = require('../errors/AppError');

class DirectoryService {
  /**
   * Get Doctor Directory with availability summary and department details
   */
  async getDoctorDirectory(filters = {}) {
    const query = {};

    if (filters.activeOnly !== 'false') {
      query.isActive = true;
    }

    if (filters.departmentId) {
      query.departmentId = filters.departmentId;
    }

    if (filters.specialization) {
      query.specialization = { $regex: filters.specialization, $options: 'i' };
    }

    // Fetch doctors with populated user and department info
    const doctors = await Doctor.find(query)
      .populate('userId', 'name email phone isActive')
      .populate('departmentId', 'name description isActive')
      .sort({ createdAt: -1 });

    // Filter by name search query if provided
    let filteredDoctors = doctors;
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      filteredDoctors = doctors.filter((doc) => {
        const docName = doc.userId ? doc.userId.name : '';
        const spec = doc.specialization || '';
        const deptName = doc.departmentId ? doc.departmentId.name : '';
        return searchRegex.test(docName) || searchRegex.test(spec) || searchRegex.test(deptName);
      });
    }

    // Fetch active availability summaries for these doctors
    const doctorIds = filteredDoctors.map((d) => d._id);
    const availabilities = await DoctorAvailability.find({
      doctorId: { $in: doctorIds },
      isActive: true,
    });

    const availabilityMap = new Map();
    for (const avail of availabilities) {
      const dId = avail.doctorId.toString();
      if (!availabilityMap.has(dId)) {
        availabilityMap.set(dId, []);
      }
      availabilityMap.get(dId).push({
        date: avail.date,
        startTime: avail.startTime,
        endTime: avail.endTime,
        slotDurationMinutes: avail.slotDurationMinutes,
      });
    }

    // Format output
    return filteredDoctors.map((doc) => ({
      doctorId: doc._id,
      name: doc.userId ? doc.userId.name : 'Unknown Doctor',
      email: doc.userId ? doc.userId.email : '',
      phone: doc.userId ? doc.userId.phone : '',
      specialization: doc.specialization,
      department: doc.departmentId
        ? {
            id: doc.departmentId._id,
            name: doc.departmentId.name,
            description: doc.departmentId.description,
          }
        : null,
      qualifications: doc.qualifications,
      experienceYears: doc.experienceYears,
      consultationFee: doc.consultationFee,
      bio: doc.bio,
      isActive: doc.isActive && (doc.userId ? doc.userId.isActive : true),
      availabilitySummary: availabilityMap.get(doc._id.toString()) || [],
    }));
  }

  /**
   * Get Department Directory with doctor count and active status
   */
  async getDepartmentDirectory() {
    const departments = await Department.find().sort({ name: 1 });

    // Count doctors in each department
    const doctorCounts = await Doctor.aggregate([
      {
        $group: {
          _id: '$departmentId',
          totalDoctors: { $sum: 1 },
          activeDoctors: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
          },
        },
      },
    ]);

    const countMap = new Map();
    for (const item of doctorCounts) {
      if (item._id) {
        countMap.set(item._id.toString(), {
          totalDoctors: item.totalDoctors,
          activeDoctors: item.activeDoctors,
        });
      }
    }

    return departments.map((dept) => {
      const counts = countMap.get(dept._id.toString()) || { totalDoctors: 0, activeDoctors: 0 };
      return {
        departmentId: dept._id,
        name: dept.name,
        description: dept.description,
        isActive: dept.isActive,
        totalDoctors: counts.totalDoctors,
        activeDoctors: counts.activeDoctors,
      };
    });
  }

  /**
   * Get Patient Directory (Authorized for ADMIN, RECEPTIONIST, DOCTOR only)
   */
  async getPatientDirectory(requestingUser, filters = {}) {
    // 1. Strictly enforce privacy: Patients cannot access patient directory
    if (requestingUser.role === 'PATIENT') {
      throw AppError.forbidden(
        'Patients are not authorized to view the patient directory. Privacy protection enforced.',
        'FORBIDDEN'
      );
    }

    const query = {};
    const patients = await Patient.find(query)
      .populate('userId', 'name email phone isActive')
      .sort({ createdAt: -1 });

    let filtered = patients;

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      filtered = patients.filter((p) => {
        const name = p.userId ? p.userId.name : '';
        const email = p.userId ? p.userId.email : '';
        const phone = p.userId ? p.userId.phone : '';
        const blood = p.bloodGroup || '';
        return searchRegex.test(name) || searchRegex.test(email) || searchRegex.test(phone) || searchRegex.test(blood);
      });
    }

    if (filters.bloodGroup) {
      filtered = filtered.filter((p) => p.bloodGroup === filters.bloodGroup);
    }

    return filtered.map((p) => ({
      patientId: p._id,
      name: p.userId ? p.userId.name : 'Unknown Patient',
      email: p.userId ? p.userId.email : '',
      phone: p.userId ? p.userId.phone : '',
      dob: p.dob,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      address: p.address,
      medicalNotes: requestingUser.role === 'DOCTOR' || requestingUser.role === 'ADMIN' ? p.medicalNotes : undefined,
    }));
  }
}

module.exports = new DirectoryService();
