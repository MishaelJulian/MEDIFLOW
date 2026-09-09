const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const Patient = require('../src/models/Patient');
const Department = require('../src/models/Department');
const Appointment = require('../src/models/Appointment');

describe('Member 3 — Admin Controls & User Management Module (M12)', () => {
  let adminToken, doctorToken, patientToken;
  let adminUser, doctorUser, patientUser, extraUser;
  let departmentDoc, doctorDoc, patientDoc, testAppointment;

  beforeEach(async () => {
    departmentDoc = await Department.create({
      name: 'Neurology',
      description: 'Neurology and brain health',
    });

    // Admin User
    adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin.ctrl@mediflow.com',
      passwordHash: 'adminpass123',
      role: 'ADMIN',
    });
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin.ctrl@mediflow.com',
      password: 'adminpass123',
    });
    adminToken = adminLogin.body.data.token;

    // Doctor User
    doctorUser = await User.create({
      name: 'Dr. Strange',
      email: 'strange@mediflow.com',
      passwordHash: 'doctorpass123',
      role: 'DOCTOR',
    });
    doctorDoc = await Doctor.create({
      userId: doctorUser._id,
      departmentId: departmentDoc._id,
      specialization: 'Neurology',
      consultationFee: 200,
    });
    const docLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'strange@mediflow.com',
      password: 'doctorpass123',
    });
    doctorToken = docLogin.body.data.token;

    // Patient User
    patientUser = await User.create({
      name: 'Peter Parker',
      email: 'peter@example.com',
      passwordHash: 'patientpass123',
      role: 'PATIENT',
    });
    patientDoc = await Patient.create({
      userId: patientUser._id,
      gender: 'MALE',
    });
    const patLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'peter@example.com',
      password: 'patientpass123',
    });
    patientToken = patLogin.body.data.token;

    // Extra user for role/status test
    extraUser = await User.create({
      name: 'Inactive User Candidate',
      email: 'candidate@example.com',
      passwordHash: 'testpass123',
      role: 'PATIENT',
    });

    testAppointment = await Appointment.create({
      patientId: patientDoc._id,
      doctorId: doctorDoc._id,
      departmentId: departmentDoc._id,
      date: '2026-12-01',
      startTime: '14:00',
      endTime: '14:30',
      status: 'BOOKED',
      slotKey: `${doctorDoc._id}_2026-12-01_14:00`,
    });
  });

  describe('GET /api/v1/admin/users (List Users with Filters)', () => {
    it('should list all users for Admin with role and status filtering', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users?role=DOCTOR')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].email).toBe('strange@mediflow.com');
    });

    it('should reject non-admin doctor or patient (RBAC)', async () => {
      const resDoc = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(resDoc.status).toBe(403);

      const resPat = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(resPat.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/status (Account Activation/Deactivation)', () => {
    it('should deactivate a user account', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${extraUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);

      const updated = await User.findById(extraUser._id);
      expect(updated.isActive).toBe(false);
    });

    it('should prevent admin from deactivating their own account', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${adminUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('cannot deactivate their own account');
    });
  });

  describe('PATCH /api/v1/admin/users/:id/role (Role Updates)', () => {
    it('should change user role to RECEPTIONIST', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${extraUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'RECEPTIONIST' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('RECEPTIONIST');
    });

    it('should reject invalid roles', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${extraUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'SUPERUSER' });

      expect(res.status).toBe(400);
    });
  });

  describe('Appointment Oversight & Status Override', () => {
    it('should allow admin to view all clinic appointments', async () => {
      const res = await request(app)
        .get('/api/v1/admin/appointments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should allow admin to override appointment status to COMPLETED', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/appointments/${testAppointment._id}/override`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'COMPLETED',
          notes: 'Administrative completion verified',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
    });
  });
});
