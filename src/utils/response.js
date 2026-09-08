/**
 * Standard API Response Utilities matching MediFlow API Contract
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, statusCode = 500, message = 'Internal Server Error', errorCode = 'INTERNAL_SERVER_ERROR', errors = null) => {
  const payload = {
    success: false,
    message,
    errorCode,
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};
