const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient must be linked to a User account'],
      unique: true,
    },
    dob: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: {
        values: ['MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED'],
        message: '{VALUE} is not a valid gender option',
      },
      default: 'NOT_SPECIFIED',
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'],
        message: '{VALUE} is not a valid blood group',
      },
      default: 'UNKNOWN',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    medicalNotes: {
      type: String,
      default: '',
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

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
