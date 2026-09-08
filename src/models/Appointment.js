const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Appointment must have an associated patient'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Appointment must have an associated doctor'],
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Appointment must have an associated department'],
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Appointment date is required in YYYY-MM-DD format'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
      index: true,
    },
    startTime: {
      type: String, // HH:MM
      required: [true, 'Start time is required in HH:MM format'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM (24h) format'],
    },
    endTime: {
      type: String, // HH:MM
      required: [true, 'End time is required in HH:MM format'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM (24h) format'],
    },
    status: {
      type: String,
      enum: {
        values: ['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
        message: '{VALUE} is not a valid appointment status',
      },
      default: 'BOOKED',
      index: true,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    cancelledReason: {
      type: String,
      trim: true,
      default: null,
    },
    // Slot key for atomic double-booking prevention: doctorId_date_startTime (only set when status is active)
    slotKey: {
      type: String,
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

// Indexes
// Sparse unique index on slotKey prevents duplicate active bookings for the same doctor at the same slot
appointmentSchema.index({ slotKey: 1 }, { unique: true, sparse: true });
appointmentSchema.index({ doctorId: 1, date: 1, status: 1 });
appointmentSchema.index({ patientId: 1, date: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
