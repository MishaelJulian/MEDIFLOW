const { validationResult } = require('express-validator');
const AppError = require('../errors/AppError');

/**
 * Middleware to check express-validator validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return next(AppError.validation('Validation failed for one or more fields', formattedErrors));
  }
  next();
};

module.exports = validate;
