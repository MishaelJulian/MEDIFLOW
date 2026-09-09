const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Line item description is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Line item amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1'],
  },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: false,
    },
    lineItems: [lineItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'INSURANCE', 'UPI', 'ONLINE_SIMULATION', null],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ appointmentId: 1 });
invoiceSchema.index({ patientId: 1, paymentStatus: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
