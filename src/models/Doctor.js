const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor must be linked to a User account'],
      unique: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Doctor must belong to a Department'],
    },
    specialization: {
      type: String,
      required: [true, 'Please provide a specialization'],
      trim: true,
      maxlength: [100, 'Specialization cannot exceed 100 characters'],
    },
    qualifications: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },
    consultationFee: {
      type: Number,
      min: [0, 'Consultation fee cannot be negative'],
      default: 0,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
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

// Indexes for search and filters
doctorSchema.index({ departmentId: 1, isActive: 1 });
doctorSchema.index({ specialization: 1, isActive: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
