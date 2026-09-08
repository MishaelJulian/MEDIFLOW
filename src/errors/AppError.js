class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Invalid request parameters', errorCode = 'BAD_REQUEST', errors = null) {
    return new AppError(message, 400, errorCode, errors);
  }

  static unauthorized(message = 'Authentication required to access this resource', errorCode = 'AUTHENTICATION_REQUIRED') {
    return new AppError(message, 401, errorCode);
  }

  static forbidden(message = 'You do not have permission to perform this action', errorCode = 'FORBIDDEN') {
    return new AppError(message, 403, errorCode);
  }

  static notFound(message = 'Requested resource not found', errorCode = 'NOT_FOUND') {
    return new AppError(message, 404, errorCode);
  }

  static conflict(message = 'Resource conflict detected', errorCode = 'SLOT_CONFLICT') {
    return new AppError(message, 409, errorCode);
  }

  static validation(message = 'Validation failed', errors = null) {
    return new AppError(message, 400, 'VALIDATION_ERROR', errors);
  }

  static businessRule(message = 'Business rule violation', errorCode = 'BUSINESS_RULE_VIOLATION') {
    return new AppError(message, 400, errorCode);
  }
}

module.exports = AppError;
