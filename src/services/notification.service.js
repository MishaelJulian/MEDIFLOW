const Notification = require('../models/Notification');
const AppError = require('../errors/AppError');

class NotificationService {
  /**
   * Create and send a notification to a recipient user
   */
  async createNotification({ recipient, type, message, relatedEntity = null }) {
    if (!recipient) {
      return null;
    }

    try {
      const notification = new Notification({
        recipient,
        type: type || 'GENERAL',
        message: message.trim(),
        relatedEntity: relatedEntity || undefined,
      });

      return await notification.save();
    } catch (err) {
      // Notification errors should not crash main transactions, but log in non-test
      if (process.env.NODE_ENV !== 'test') {
        console.error('Failed to create notification:', err);
      }
      return null;
    }
  }

  /**
   * Get notifications for a user with pagination and filter
   */
  async getUserNotifications(userId, options = {}) {
    const query = { recipient: userId };

    if (options.isRead !== undefined) {
      query.isRead = options.isRead === 'true' || options.isRead === true;
    }

    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Mark a single notification as read (ensuring ownership)
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw AppError.notFound(`Notification not found with ID: ${notificationId}`, 'NOT_FOUND');
    }

    if (notification.recipient.toString() !== userId.toString()) {
      throw AppError.forbidden('You are not authorized to modify this notification', 'FORBIDDEN');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return notification;
  }

  /**
   * Mark all notifications for a user as read
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return {
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Get unread notifications count for a user
   */
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return { unreadCount: count };
  }
}

module.exports = new NotificationService();
