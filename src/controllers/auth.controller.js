const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendSuccess(res, 201, 'Patient registered successfully', result);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return sendSuccess(res, 200, 'Login successful', result);
});

const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getCurrentUser(req.user._id);
  return sendSuccess(res, 200, 'Current user retrieved successfully', result);
});

module.exports = {
  register,
  login,
  getMe,
};
