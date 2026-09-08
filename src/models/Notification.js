const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must have a recipient'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: [
          'APPOINTMENT_CREATED',
          'APPOINTMENT_CONFIRMED',
          'APPOINTMENT_CANCELLED',
          'APPOINTMENT_COMPLETED',
          'APPOINTMENT_NO_SHOW',
          'PRESCRIPTION_AVAILABLE',
          'BILLING_EVENT',
          'GENERAL',
        ],
        message: '{VALUE} is not a valid notification type',
      },
      default: 'GENERAL',
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Appointment', 'Prescription', 'Invoice', 'User', 'Doctor', 'Patient', null],
        default: null,
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for fast queries on recipient's unread notifications
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
