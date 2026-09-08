const mongoose = require('mongoose');

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Availability must belong to a Doctor'],
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Please provide a valid date in YYYY-MM-DD format'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
      index: true,
    },
    startTime: {
      type: String, // Format: HH:MM (24h)
      required: [true, 'Please provide a start time in HH:MM format'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM (24h) format'],
    },
    endTime: {
      type: String, // Format: HH:MM (24h)
      required: [true, 'Please provide an end time in HH:MM format'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM (24h) format'],
    },
    slotDuration: {
      type: Number,
      default: 30, // Duration in minutes per slot
      min: [5, 'Slot duration must be at least 5 minutes'],
      max: [120, 'Slot duration cannot exceed 120 minutes'],
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Compound index for querying doctor availability on specific dates
doctorAvailabilitySchema.index({ doctorId: 1, date: 1, isActive: 1 });

const DoctorAvailability = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);

module.exports = DoctorAvailability;
