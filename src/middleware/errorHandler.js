const AppError = require('../errors/AppError');
const { sendError } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.stack = err.stack;

  // Log in development
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${err.name || 'Error'}: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }

  // Handle Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return sendError(res, 404, message, 'NOT_FOUND');
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'resource';
    const message = `Duplicate value entered for '${field}'. A resource with this ${field} already exists.`;
    return sendError(res, 409, message, 'DUPLICATE_RESOURCE');
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
    return sendError(res, 400, 'Validation failed for one or more fields', 'VALIDATION_ERROR', errors);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid authentication token. Please log in again.', 'AUTHENTICATION_REQUIRED');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Authentication token has expired. Please log in again.', 'AUTHENTICATION_REQUIRED');
  }

  // Handle AppError instances
  if (err instanceof AppError || err.isOperational) {
    return sendError(res, err.statusCode, err.message, err.errorCode, err.errors);
  }

  // Fallback for unhandled internal errors
  return sendError(
    res,
    500,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error',
    'INTERNAL_SERVER_ERROR'
  );
};

module.exports = errorHandler;
