const { param, query } = require('express-validator');

const notificationIdParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID is required')
    .isMongoId()
    .withMessage('Notification ID must be a valid MongoDB ObjectId'),
];

const listNotificationsQueryValidator = [
  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean (true/false)'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  notificationIdParamValidator,
  listNotificationsQueryValidator,
};
