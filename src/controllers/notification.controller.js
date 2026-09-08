const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getUserNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user._id, req.query);
  return sendSuccess(res, 200, 'Notifications retrieved successfully', result.notifications, result.pagination);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  return sendSuccess(res, 200, 'Notification marked as read', notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);
  return sendSuccess(res, 200, 'All notifications marked as read', result);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user._id);
  return sendSuccess(res, 200, 'Unread count retrieved successfully', result);
});

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
