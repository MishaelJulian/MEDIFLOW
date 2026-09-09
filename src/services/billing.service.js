const Invoice = require('../models/Invoice');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const AppError = require('../errors/AppError');

class BillingService {
  /**
   * Create or generate an invoice for a specific appointment
   */
  async createInvoice({ appointmentId, lineItems = [], discount = 0, tax = 0, notes }) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId')
      .populate('doctorId');

    if (!appointment) {
      throw AppError.notFound('Appointment not found');
    }

    // Check if an invoice already exists for this appointment
    const existing = await Invoice.findOne({ appointmentId: appointment._id });
    if (existing) {
      return existing;
    }

    // Compute line items
    let computedItems = [...lineItems];
    if (computedItems.length === 0) {
      const consultationFee = appointment.doctorId?.consultationFee || 100;
      computedItems.push({
        description: `Consultation Fee (${appointment.doctorId?.specialization || 'General Consultation'})`,
        amount: consultationFee,
        quantity: 1,
      });
    }

    const subtotal = computedItems.reduce((acc, item) => acc + item.amount * (item.quantity || 1), 0);
    const total = Math.max(0, subtotal + tax - discount);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      appointmentId: appointment._id,
      patientId: appointment.patientId._id,
      doctorId: appointment.doctorId?._id,
      lineItems: computedItems,
      subtotal,
      tax,
      discount,
      total,
      paymentStatus: 'PENDING',
      notes,
    });

    // Notify patient
    try {
      if (appointment.patientId?.userId) {
        await Notification.create({
          recipient: appointment.patientId.userId,
          type: 'BILLING_EVENT',
          message: `Invoice ${invoiceNumber} for $${total} has been generated for your visit.`,
          relatedEntity: {
            entityType: 'Invoice',
            entityId: invoice._id,
          },
        });
      }
    } catch (err) {
      console.error('[BillingService] Notification creation failed:', err.message);
    }

    return invoice;
  }

  /**
   * Get an invoice by ID with ownership/role authorization
   */
  async getInvoiceById(invoiceId, user) {
    const invoice = await Invoice.findById(invoiceId)
      .populate({
        path: 'appointmentId',
        select: 'date startTime endTime status reason',
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!invoice) {
      throw AppError.notFound('Invoice not found');
    }

    // Authorization check
    if (user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: user._id });
      if (!patient || invoice.patientId._id.toString() !== patient._id.toString()) {
        throw AppError.forbidden('You are not authorized to view this invoice');
      }
    }

    return invoice;
  }

  /**
   * Get invoices for current patient
   */
  async getMyInvoices(userId) {
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return [];
    }

    return await Invoice.find({ patientId: patient._id })
      .populate('appointmentId', 'date startTime endTime status')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' },
      })
      .sort({ createdAt: -1 });
  }

  /**
   * Process simulated payment for an invoice
   */
  async payInvoice(invoiceId, paymentMethod = 'ONLINE_SIMULATION', user) {
    const invoice = await Invoice.findById(invoiceId).populate('patientId');
    if (!invoice) {
      throw AppError.notFound('Invoice not found');
    }

    if (user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: user._id });
      if (!patient || invoice.patientId._id.toString() !== patient._id.toString()) {
        throw AppError.forbidden('You are not authorized to pay this invoice');
      }
    }

    if (invoice.paymentStatus === 'PAID') {
      throw AppError.badRequest('Invoice has already been paid');
    }

    invoice.paymentStatus = 'PAID';
    invoice.paidAt = new Date();
    invoice.paymentMethod = paymentMethod;
    await invoice.save();

    // Send confirmation notification
    try {
      if (invoice.patientId?.userId) {
        await Notification.create({
          recipient: invoice.patientId.userId,
          type: 'BILLING_EVENT',
          message: `Payment of $${invoice.total} for Invoice ${invoice.invoiceNumber} was successful.`,
          relatedEntity: {
            entityType: 'Invoice',
            entityId: invoice._id,
          },
        });
      }
    } catch (err) {
      console.error('[BillingService] Notification creation failed:', err.message);
    }

    return invoice;
  }

  /**
   * Update invoice status (Admin / Receptionist)
   */
  async updateInvoiceStatus(invoiceId, { paymentStatus, notes }) {
    const invoice = await Invoice.findById(invoiceId).populate('patientId');
    if (!invoice) {
      throw AppError.notFound('Invoice not found');
    }

    if (paymentStatus) {
      invoice.paymentStatus = paymentStatus;
    }
    if (notes) {
      invoice.notes = notes;
    }
    if (paymentStatus === 'PAID' && !invoice.paidAt) {
      invoice.paidAt = new Date();
    }

    await invoice.save();

    // Send notification for status change
    try {
      if (invoice.patientId?.userId) {
        await Notification.create({
          recipient: invoice.patientId.userId,
          type: 'BILLING_EVENT',
          message: `Invoice ${invoice.invoiceNumber} status has been updated to ${paymentStatus}.`,
          relatedEntity: {
            entityType: 'Invoice',
            entityId: invoice._id,
          },
        });
      }
    } catch (err) {
      console.error('[BillingService] Notification creation failed:', err.message);
    }

    return invoice;
  }

  /**
   * Query all invoices (Admin / Receptionist)
   */
  async getAllInvoices(query = {}) {
    const filter = {};
    if (query.paymentStatus) {
      filter.paymentStatus = query.paymentStatus;
    }
    if (query.patientId) {
      filter.patientId = query.patientId;
    }
    if (query.doctorId) {
      filter.doctorId = query.doctorId;
    }

    return await Invoice.find(filter)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('appointmentId', 'date startTime endTime status')
      .sort({ createdAt: -1 });
  }
}

module.exports = new BillingService();
