const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const Patient = require('../src/models/Patient');
const Department = require('../src/models/Department');
const Appointment = require('../src/models/Appointment');
const Invoice = require('../src/models/Invoice');

describe('Member 3 — Billing & Invoices Module (M10)', () => {
  let adminToken, doctorToken, patientToken, otherPatientToken, receptionistToken;
  let adminUser, doctorUser, patientUser, otherPatientUser, receptionistUser;
  let departmentDoc, doctorDoc, patientDoc, otherPatientDoc;
  let testAppointment, testAppointment2;

  beforeEach(async () => {
    // 1. Department
    departmentDoc = await Department.create({
      name: 'General Medicine',
      description: 'Primary care & general checkups',
    });

    // 2. Admin
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin.billing@mediflow.com',
      passwordHash: 'password123',
      role: 'ADMIN',
    });
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin.billing@mediflow.com',
      password: 'password123',
    });
    adminToken = adminLogin.body.data.token;

    // 3. Receptionist
    receptionistUser = await User.create({
      name: 'Front Desk Officer',
      email: 'frontdesk@mediflow.com',
      passwordHash: 'password123',
      role: 'RECEPTIONIST',
    });
    const recLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'frontdesk@mediflow.com',
      password: 'password123',
    });
    receptionistToken = recLogin.body.data.token;

    // 4. Doctor
    doctorUser = await User.create({
      name: 'Dr. Gregory House',
      email: 'dr.house.billing@mediflow.com',
      passwordHash: 'password123',
      role: 'DOCTOR',
    });
    doctorDoc = await Doctor.create({
      userId: doctorUser._id,
      departmentId: departmentDoc._id,
      specialization: 'Internal Medicine',
      consultationFee: 150,
    });
    const docLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'dr.house.billing@mediflow.com',
      password: 'password123',
    });
    doctorToken = docLogin.body.data.token;

    // 5. Patient 1
    patientUser = await User.create({
      name: 'Alice Patient',
      email: 'alice.billing@example.com',
      passwordHash: 'password123',
      role: 'PATIENT',
    });
    patientDoc = await Patient.create({
      userId: patientUser._id,
      gender: 'FEMALE',
    });
    const patLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'alice.billing@example.com',
      password: 'password123',
    });
    patientToken = patLogin.body.data.token;

    // 6. Patient 2 (Other patient)
    otherPatientUser = await User.create({
      name: 'Bob Other',
      email: 'bob.billing@example.com',
      passwordHash: 'password123',
      role: 'PATIENT',
    });
    otherPatientDoc = await Patient.create({
      userId: otherPatientUser._id,
      gender: 'MALE',
    });
    const otherLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'bob.billing@example.com',
      password: 'password123',
    });
    otherPatientToken = otherLogin.body.data.token;

    // 7. Appointments
    testAppointment = await Appointment.create({
      patientId: patientDoc._id,
      doctorId: doctorDoc._id,
      departmentId: departmentDoc._id,
      date: '2026-11-25',
      startTime: '09:00',
      endTime: '09:30',
      status: 'COMPLETED',
      slotKey: `${doctorDoc._id}_2026-11-25_09:00`,
    });

    testAppointment2 = await Appointment.create({
      patientId: otherPatientDoc._id,
      doctorId: doctorDoc._id,
      departmentId: departmentDoc._id,
      date: '2026-11-25',
      startTime: '10:00',
      endTime: '10:30',
      status: 'BOOKED',
      slotKey: `${doctorDoc._id}_2026-11-25_10:00`,
    });
  });

  describe('POST /api/v1/billing (Create Invoice)', () => {
    it('should create an invoice with default doctor consultation fee when line items are omitted', async () => {
      const res = await request(app)
        .post('/api/v1/billing')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId: testAppointment._id,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('invoiceNumber');
      expect(res.body.data.total).toBe(150);
      expect(res.body.data.subtotal).toBe(150);
      expect(res.body.data.paymentStatus).toBe('PENDING');
      expect(res.body.data.lineItems.length).toBe(1);
      expect(res.body.data.lineItems[0].amount).toBe(150);
    });

    it('should calculate correct totals with custom line items, tax, and discount', async () => {
      const res = await request(app)
        .post('/api/v1/billing')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({
          appointmentId: testAppointment2._id,
          lineItems: [
            { description: 'Consultation', amount: 100, quantity: 1 },
            { description: 'Blood Test', amount: 50, quantity: 2 },
          ],
          tax: 20,
          discount: 10,
          notes: 'Standard checkup plus diagnostics',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      // Subtotal: 100 + (50 * 2) = 200
      // Total: 200 + 20 - 10 = 210
      expect(res.body.data.subtotal).toBe(200);
      expect(res.body.data.tax).toBe(20);
      expect(res.body.data.discount).toBe(10);
      expect(res.body.data.total).toBe(210);
    });

    it('should return existing invoice if already created for appointment', async () => {
      const first = await request(app)
        .post('/api/v1/billing')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ appointmentId: testAppointment._id });

      const second = await request(app)
        .post('/api/v1/billing')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ appointmentId: testAppointment._id });

      expect(second.status).toBe(201);
      expect(second.body.data._id).toBe(first.body.data._id);
    });

    it('should reject invoice creation by unauthorized Patient', async () => {
      const res = await request(app)
        .post('/api/v1/billing')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ appointmentId: testAppointment._id });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/billing/:id & GET /api/v1/billing/my-invoices', () => {
    let createdInvoice;

    beforeEach(async () => {
      createdInvoice = await Invoice.create({
        invoiceNumber: 'INV-TEST-001',
        appointmentId: testAppointment._id,
        patientId: patientDoc._id,
        doctorId: doctorDoc._id,
        lineItems: [{ description: 'Consultation', amount: 150, quantity: 1 }],
        subtotal: 150,
        tax: 0,
        discount: 0,
        total: 150,
        paymentStatus: 'PENDING',
      });
    });

    it('should allow patient to retrieve their own invoice', async () => {
      const res = await request(app)
        .get(`/api/v1/billing/${createdInvoice._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invoiceNumber).toBe('INV-TEST-001');
    });

    it('should forbid a patient from viewing another patient invoice', async () => {
      const res = await request(app)
        .get(`/api/v1/billing/${createdInvoice._id}`)
        .set('Authorization', `Bearer ${otherPatientToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow Admin and Receptionist to view any invoice', async () => {
      const resAdmin = await request(app)
        .get(`/api/v1/billing/${createdInvoice._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(resAdmin.status).toBe(200);

      const resRec = await request(app)
        .get(`/api/v1/billing/${createdInvoice._id}`)
        .set('Authorization', `Bearer ${receptionistToken}`);
      expect(resRec.status).toBe(200);
    });

    it('should list invoices for authenticated patient via /my-invoices', async () => {
      const res = await request(app)
        .get('/api/v1/billing/my-invoices')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].invoiceNumber).toBe('INV-TEST-001');
    });
  });

  describe('POST /api/v1/billing/:id/pay (Payment Simulation)', () => {
    let unpaidInvoice;

    beforeEach(async () => {
      unpaidInvoice = await Invoice.create({
        invoiceNumber: 'INV-TEST-PAY',
        appointmentId: testAppointment._id,
        patientId: patientDoc._id,
        doctorId: doctorDoc._id,
        lineItems: [{ description: 'General Consultation', amount: 150, quantity: 1 }],
        subtotal: 150,
        total: 150,
        paymentStatus: 'PENDING',
      });
    });

    it('should process payment successfully and transition status to PAID', async () => {
      const res = await request(app)
        .post(`/api/v1/billing/${unpaidInvoice._id}/pay`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ paymentMethod: 'UPI' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentStatus).toBe('PAID');
      expect(res.body.data.paymentMethod).toBe('UPI');
      expect(res.body.data).toHaveProperty('paidAt');
    });

    it('should reject payment if invoice is already PAID', async () => {
      // First payment
      await request(app)
        .post(`/api/v1/billing/${unpaidInvoice._id}/pay`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ paymentMethod: 'CREDIT_CARD' });

      // Second payment
      const res = await request(app)
        .post(`/api/v1/billing/${unpaidInvoice._id}/pay`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ paymentMethod: 'CREDIT_CARD' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already been paid');
    });

    it('should forbid other patients from paying someone else invoice', async () => {
      const res = await request(app)
        .post(`/api/v1/billing/${unpaidInvoice._id}/pay`)
        .set('Authorization', `Bearer ${otherPatientToken}`)
        .send({ paymentMethod: 'ONLINE_SIMULATION' });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/billing/:id/status (Administrative Status Transitions)', () => {
    let testInvoice;

    beforeEach(async () => {
      testInvoice = await Invoice.create({
        invoiceNumber: 'INV-TEST-STATUS',
        appointmentId: testAppointment._id,
        patientId: patientDoc._id,
        doctorId: doctorDoc._id,
        lineItems: [{ description: 'Consultation', amount: 150, quantity: 1 }],
        subtotal: 150,
        total: 150,
        paymentStatus: 'PENDING',
      });
    });

    it('should allow Admin to update status to REFUNDED', async () => {
      const res = await request(app)
        .patch(`/api/v1/billing/${testInvoice._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ paymentStatus: 'REFUNDED', notes: 'Patient consultation cancelled due to doctor emergency' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentStatus).toBe('REFUNDED');
      expect(res.body.data.notes).toContain('Patient consultation cancelled');
    });

    it('should reject invalid payment status enum', async () => {
      const res = await request(app)
        .patch(`/api/v1/billing/${testInvoice._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ paymentStatus: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
    });

    it('should reject status updates from unauthorized Patient', async () => {
      const res = await request(app)
        .patch(`/api/v1/billing/${testInvoice._id}/status`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ paymentStatus: 'REFUNDED' });

      expect(res.status).toBe(403);
    });
  });
});
