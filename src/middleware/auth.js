const { verifyToken } = require('../utils/token');
const AppError = require('../errors/AppError');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  let token = null;

  // Extract from Authorization header: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(AppError.unauthorized('Authentication token is required', 'AUTHENTICATION_REQUIRED'));
  }

  // Verify token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Authentication token has expired', 'AUTHENTICATION_REQUIRED'));
    }
    return next(AppError.unauthorized('Invalid authentication token', 'AUTHENTICATION_REQUIRED'));
  }

  // Find user
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(AppError.unauthorized('User associated with this token no longer exists', 'AUTHENTICATION_REQUIRED'));
  }

  if (!user.isActive) {
    return next(AppError.forbidden('Your account has been deactivated. Please contact an administrator.', 'FORBIDDEN'));
  }

  // Attach safe user object to request
  req.user = user;

  // If patient or doctor, attach role-specific document references for convenience
  if (user.role === 'PATIENT') {
    const patient = await Patient.findOne({ userId: user._id });
    req.patient = patient;
  } else if (user.role === 'DOCTOR') {
    const doctor = await Doctor.findOne({ userId: user._id });
    req.doctor = doctor;
  }

  next();
});

module.exports = authenticate;
