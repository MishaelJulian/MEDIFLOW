const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      maxlength: [200, 'Medicine name cannot exceed 200 characters'],
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required (e.g., 500mg, 1 tablet)'],
      trim: true,
      maxlength: [100, 'Dosage cannot exceed 100 characters'],
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required (e.g., Twice daily, 1-0-1)'],
      trim: true,
      maxlength: [100, 'Frequency cannot exceed 100 characters'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required (e.g., 5 days, 2 weeks)'],
      trim: true,
      maxlength: [100, 'Duration cannot exceed 100 characters'],
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Instructions cannot exceed 500 characters'],
    },
  },
  { _id: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Prescription must be linked to an appointment'],
      unique: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Prescription must be linked to a doctor'],
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Prescription must be linked to a patient'],
      index: true,
    },
    diagnosis: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Diagnosis cannot exceed 500 characters'],
    },
    items: {
      type: [prescriptionItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'Prescription must contain at least one medicine item',
      },
      required: [true, 'Prescription items are required'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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
prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
