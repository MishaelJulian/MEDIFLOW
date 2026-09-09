const billingService = require('../services/billing.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await billingService.createInvoice(req.body);
  return sendSuccess(res, 201, 'Invoice created successfully', invoice);
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await billingService.getInvoiceById(req.params.id, req.user);
  return sendSuccess(res, 200, 'Invoice retrieved successfully', invoice);
});

const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await billingService.getMyInvoices(req.user._id);
  return sendSuccess(res, 200, 'Patient invoices retrieved successfully', invoices);
});

const payInvoice = asyncHandler(async (req, res) => {
  const invoice = await billingService.payInvoice(
    req.params.id,
    req.body.paymentMethod || 'ONLINE_SIMULATION',
    req.user
  );
  return sendSuccess(res, 200, 'Invoice payment processed successfully', invoice);
});

const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await billingService.getAllInvoices(req.query);
  return sendSuccess(res, 200, 'All invoices retrieved successfully', invoices);
});

const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const invoice = await billingService.updateInvoiceStatus(req.params.id, req.body);
  return sendSuccess(res, 200, 'Invoice status updated successfully', invoice);
});

module.exports = {
  createInvoice,
  getInvoiceById,
  getMyInvoices,
  payInvoice,
  updateInvoiceStatus,
  getAllInvoices,
};

