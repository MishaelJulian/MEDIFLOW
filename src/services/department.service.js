const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const AppError = require('../errors/AppError');

class DepartmentService {
  /**
   * Create a new Department
   */
  async createDepartment(departmentData) {
    const { name, description } = departmentData;

    // Check uniqueness
    const existing = await Department.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      throw AppError.conflict(`Department with name '${name}' already exists`, 'DUPLICATE_RESOURCE');
    }

    const department = new Department({
      name: name.trim(),
      description: description ? description.trim() : '',
      isActive: true,
    });

    await department.save();
    return department;
  }

  /**
   * Get all departments (with optional active filter)
   */
  async getDepartments(filters = {}) {
    const query = {};
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }
    return await Department.find(query).sort({ name: 1 });
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(departmentId) {
    const department = await Department.findById(departmentId);
    if (!department) {
      throw AppError.notFound(`Department not found with ID: ${departmentId}`, 'NOT_FOUND');
    }
    return department;
  }

  /**
   * Update department
   */
  async updateDepartment(departmentId, updateData) {
    const department = await Department.findById(departmentId);
    if (!department) {
      throw AppError.notFound(`Department not found with ID: ${departmentId}`, 'NOT_FOUND');
    }

    if (updateData.name && updateData.name.trim().toLowerCase() !== department.name.toLowerCase()) {
      const existing = await Department.findOne({
        name: { $regex: new RegExp(`^${updateData.name.trim()}$`, 'i') },
        _id: { $ne: departmentId },
      });
      if (existing) {
        throw AppError.conflict(`Department with name '${updateData.name}' already exists`, 'DUPLICATE_RESOURCE');
      }
      department.name = updateData.name.trim();
    }

    if (updateData.description !== undefined) {
      department.description = updateData.description.trim();
    }

    if (updateData.isActive !== undefined) {
      // If deactivating, verify if active doctors exist
      if (updateData.isActive === false) {
        const activeDoctorCount = await Doctor.countDocuments({ departmentId, isActive: true });
        if (activeDoctorCount > 0) {
          throw AppError.badRequest(
            `Cannot deactivate department with ${activeDoctorCount} active linked doctor(s). Reassign or deactivate doctors first.`,
            'BUSINESS_RULE_VIOLATION'
          );
        }
      }
      department.isActive = updateData.isActive;
    }

    await department.save();
    return department;
  }

  /**
   * Deactivate/Delete department
   */
  async deleteDepartment(departmentId) {
    const department = await Department.findById(departmentId);
    if (!department) {
      throw AppError.notFound(`Department not found with ID: ${departmentId}`, 'NOT_FOUND');
    }

    const activeDoctorCount = await Doctor.countDocuments({ departmentId, isActive: true });
    if (activeDoctorCount > 0) {
      throw AppError.badRequest(
        `Cannot delete/deactivate department with ${activeDoctorCount} active linked doctor(s).`,
        'BUSINESS_RULE_VIOLATION'
      );
    }

    department.isActive = false;
    await department.save();
    return department;
  }
}

module.exports = new DepartmentService();
