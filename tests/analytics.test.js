const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const Patient = require('../src/models/Patient');
const Department = require('../src/models/Department');
const Appointment = require('../src/models/Appointment');

describe('AI / Analytics Bonus Module (M15)', () => {
  let adminToken, doctorToken, patientToken;
  let doctorDoc, patientDoc, department, testAppointment;

  beforeEach(async () => {
    department = await Department.create({
      name: 'Cardiology',
      description: 'Cardiology care',
    });

    // Admin
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@mediflow.com',
      passwordHash: 'password123',
      role: 'ADMIN',
    });
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@mediflow.com',
      password: 'password123',
    });
    adminToken = adminLogin.body.data.token;

    // Doctor
    const doctorUser = await User.create({
      name: 'Dr. House',
      email: 'doctor@mediflow.com',
      passwordHash: 'password123',
      role: 'DOCTOR',
    });
    doctorDoc = await Doctor.create({
      userId: doctorUser._id,
      departmentId: department._id,
      specialization: 'Cardiology',
    });
    const docLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'doctor@mediflow.com',
      password: 'password123',
    });
    doctorToken = docLogin.body.data.token;

    // Patient
    const patientUser = await User.create({
      name: 'Patient John',
      email: 'patient@example.com',
      passwordHash: 'password123',
      role: 'PATIENT',
    });
    patientDoc = await Patient.create({
      userId: patientUser._id,
      gender: 'MALE',
    });
    const patLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'patient@example.com',
      password: 'password123',
    });
    patientToken = patLogin.body.data.token;

    // Appointment
    testAppointment = await Appointment.create({
      patientId: patientDoc._id,
      doctorId: doctorDoc._id,
      departmentId: department._id,
      date: '2026-11-20',
      startTime: '10:00',
      endTime: '10:30',
      status: 'BOOKED',
      slotKey: `${doctorDoc._id}_2026-11-20_10:00`,
    });
  });

  describe('GET /api/v1/analytics/no-show-risk/:appointmentId', () => {
    it('should compute no-show risk assessment successfully for Admin', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/no-show-risk/${testAppointment._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('riskLevel');
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(res.body.data.riskLevel);
      expect(res.body.data).toHaveProperty('riskScore');
      expect(typeof res.body.data.riskScore).toBe('number');
      expect(res.body.data.riskScore).toBeGreaterThanOrEqual(0);
      expect(res.body.data.riskScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(res.body.data.factors)).toBe(true);
      expect(res.body.data.disclaimer).toContain('Operational analytics only');
    });

    it('should allow authorized Doctor to access prediction', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/no-show-risk/${testAppointment._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject non-operational Patient from accessing no-show risk (RBAC)', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/no-show-risk/${testAppointment._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get(`/api/v1/analytics/no-show-risk/${testAppointment._id}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/analytics/dashboard-summary & /admin-dashboard', () => {
    it('should retrieve hospital operational analytics for Admin', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/dashboard-summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toHaveProperty('totalPatients');
      expect(res.body.data.summary).toHaveProperty('totalDoctors');
      expect(res.body.data.summary).toHaveProperty('totalAppointments');
      expect(res.body.data).toHaveProperty('appointmentStatusDistribution');
    });

    it('should reject Patient from accessing hospital summary (RBAC)', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/dashboard-summary')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/analytics/reports (Operational Reports - M13)', () => {
    it('should generate comprehensive reports for Admin', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('metrics');
      expect(res.body.data.metrics).toHaveProperty('appointmentsPerDay');
      expect(res.body.data.metrics).toHaveProperty('appointmentsByDepartment');
      expect(res.body.data.metrics).toHaveProperty('doctorWorkload');
      expect(res.body.data.metrics).toHaveProperty('revenue');
    });

    it('should block non-admin from accessing reports', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/reports')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/analytics/doctor-dashboard & /patient-dashboard', () => {
    it('should retrieve doctor-specific dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/doctor-dashboard')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('todayAppointments');
      expect(res.body.data).toHaveProperty('upcomingAppointments');
      expect(res.body.data).toHaveProperty('completedConsultations');
    });

    it('should retrieve patient-specific dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/patient-dashboard')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('invoicesSummary');
      expect(res.body.data).toHaveProperty('unreadNotificationsCount');
    });
  });
});
