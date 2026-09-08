const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  notificationIdParamValidator,
  listNotificationsQueryValidator,
} = require('../validators/notification.validators');

// All notification routes require authentication
router.use(authenticate);

// List user notifications
router.get(
  '/',
  listNotificationsQueryValidator,
  validate,
  notificationController.getUserNotifications
);

// Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all notifications as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Mark single notification as read
router.patch(
  '/:id/read',
  notificationIdParamValidator,
  validate,
  notificationController.markAsRead
);

module.exports = router;
