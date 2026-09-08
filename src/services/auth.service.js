const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const AppError = require('../errors/AppError');
const { generateToken } = require('../utils/token');

class AuthService {
  /**
   * Register a new Patient
   * Normal public registration always forces PATIENT role
   */
  async register(userData) {
    const { name, email, password, phone, dob, gender, bloodGroup, address, medicalNotes } = userData;

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw AppError.conflict('An account with this email address already exists', 'DUPLICATE_RESOURCE');
    }

    // Force PATIENT role for public registration
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: password, // Pre-save hook hashes it
      role: 'PATIENT',
      phone: phone || '',
      isActive: true,
    });

    await user.save();

    // Create linked Patient profile
    const patient = new Patient({
      userId: user._id,
      dob: dob || null,
      gender: gender || 'NOT_SPECIFIED',
      bloodGroup: bloodGroup || 'UNKNOWN',
      address: address || {},
      medicalNotes: medicalNotes || '',
    });

    await patient.save();

    // Generate JWT token
    const token = generateToken({ id: user._id, role: user.role });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
      },
      patient: {
        id: patient._id,
        dob: patient.dob,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        address: patient.address,
      },
    };
  }

  /**
   * Login user with email & password
   */
  async login(email, password) {
    // Find user with passwordHash explicitly selected
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check if active
    if (!user.isActive) {
      throw AppError.forbidden('Your account has been deactivated. Please contact an administrator.', 'FORBIDDEN');
    }

    // Generate token
    const token = generateToken({ id: user._id, role: user.role });

    // Fetch linked entity if patient or doctor
    let profileData = null;
    if (user.role === 'PATIENT') {
      profileData = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'DOCTOR') {
      profileData = await Doctor.findOne({ userId: user._id }).populate('departmentId', 'name description');
    }

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
      },
      profile: profileData,
    };
  }

  /**
   * Get current authenticated user details
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found', 'NOT_FOUND');
    }

    let profile = null;
    if (user.role === 'PATIENT') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'DOCTOR') {
      profile = await Doctor.findOne({ userId: user._id }).populate('departmentId', 'name description');
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      profile,
    };
  }
}

module.exports = new AuthService();
