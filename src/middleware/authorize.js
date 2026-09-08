const AppError = require('../errors/AppError');

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles - e.g. 'ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST'
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication is required prior to authorization'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource`,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

module.exports = authorize;
