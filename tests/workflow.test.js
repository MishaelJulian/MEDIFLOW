const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const Patient = require('../src/models/Patient');
const Department = require('../src/models/Department');
const DoctorAvailability = require('../src/models/DoctorAvailability');
const Appointment = require('../src/models/Appointment');
const Notification = require('../src/models/Notification');

describe('Appointment Workflow & State Machine API (Member 2)', () => {
  let doctorToken, doctorUser, doctorDoc;
  let otherDoctorToken, otherDoctorUser, otherDoctorDoc;
  let patientToken, patientUser, patientDoc;
  let adminToken, adminUser;
  let department;

  beforeEach(async () => {
    department = await Department.create({
      name: 'General Medicine',
      description: 'Primary care',
    });

    // Doctor 1
    doctorUser = await User.create({
      name: 'Dr. Gregory House',
      email: 'house@mediflow.com',
      passwordHash: 'password123',
      role: 'DOCTOR',
    });
    doctorDoc = await Doctor.create({
      userId: doctorUser._id,
      departmentId: department._id,
      specialization: 'Diagnostic Medicine',
    });
    const docLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'house@mediflow.com',
      password: 'password123',
    });
    doctorToken = docLogin.body.data.token;

    // Doctor 2
    otherDoctorUser = await User.create({
      name: 'Dr. James Wilson',
      email: 'wilson@mediflow.com',
      passwordHash: 'password123',
      role: 'DOCTOR',
    });
    otherDoctorDoc = await Doctor.create({
      userId: otherDoctorUser._id,
      departmentId: department._id,
      specialization: 'Oncology',
    });
    const otherDocLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'wilson@mediflow.com',
      password: 'password123',
    });
    otherDoctorToken = otherDocLogin.body.data.token;

    // Patient
    patientUser = await User.create({
      name: 'Lisa Cuddy',
      email: 'cuddy@mediflow.com',
      passwordHash: 'password123',
      role: 'PATIENT',
    });
    patientDoc = await Patient.create({
      userId: patientUser._id,
      gender: 'FEMALE',
    });
    const patientLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'cuddy@mediflow.com',
      password: 'password123',
    });
    patientToken = patientLogin.body.data.token;

    // Admin
    adminUser = await User.create({
      name: 'Admin Boss',
      email: 'admin@mediflow.com',
      passwordHash: 'password123',
      role: 'ADMIN',
    });
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@mediflow.com',
      password: 'password123',
    });
    adminToken = adminLogin.body.data.token;
  });

  describe('Baseline State Transitions: BOOKED -> CONFIRMED -> COMPLETED', () => {
    it('should successfully execute standard lifecycle with proper role permissions and notifications', async () => {
      // 1. Create appointment in BOOKED state
      const appt = await Appointment.create({
        patientId: patientDoc._id,
        doctorId: doctorDoc._id,
        departmentId: department._id,
        date: '2026-11-20',
        startTime: '09:00',
        endTime: '09:30',
        status: 'BOOKED',
        slotKey: `${doctorDoc._id}_2026-11-20_09:00`,
      });

      // 2. Doctor confirms appointment (BOOKED -> CONFIRMED)
      const confirmRes = await request(app)
        .patch(`/api/v1/appointments/${appt._id}/confirm`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.status).toBe('CONFIRMED');

      // Check notification sent to patient
      const confirmNotif = await Notification.findOne({
        recipient: patientUser._id,
        type: 'APPOINTMENT_CONFIRMED',
      });
      expect(confirmNotif).toBeDefined();

      // 3. Doctor completes appointment (CONFIRMED -> COMPLETED)
      const completeRes = await request(app)
        .patch(`/api/v1/appointments/${appt._id}/complete`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.status).toBe('COMPLETED');

      // Check notification sent to patient
      const completeNotif = await Notification.findOne({
        recipient: patientUser._id,
        type: 'APPOINTMENT_COMPLETED',
      });
      expect(completeNotif).toBeDefined();
    });
  });

  describe('Alternate State Transitions: CANCELLED & NO_SHOW', () => {
    it('should transition CONFIRMED -> NO_SHOW and free the slotKey', async () => {
      const appt = await Appointment.create({
        patientId: patientDoc._id,
        doctorId: doctorDoc._id,
        departmentId: department._id,
        date: '2026-11-21',
        startTime: '10:00',
        endTime: '10:30',
        status: 'CONFIRMED',
        slotKey: `${doctorDoc._id}_2026-11-21_10:00`,
      });

      const res = await request(app)
        .patch(`/api/v1/appointments/${appt._id}/no-show`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('NO_SHOW');

      const updated = await Appointment.findById(appt._id);
      expect(updated.slotKey).toBeNull();
    });

    it('should transition BOOKED -> CANCELLED by patient and notify doctor', async () => {
      const appt = await Appointment.create({
        patientId: patientDoc._id,
        doctorId: doctorDoc._id,
        departmentId: department._id,
        date: '2026-11-22',
        startTime: '11:00',
        endTime: '11:30',
        status: 'BOOKED',
        slotKey: `${doctorDoc._id}_2026-11-22_11:00`,
      });

      const res = await request(app)
        .patch(`/api/v1/appointments/${appt._id}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ reason: 'Personal conflict' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');

      // Check notification to doctor
      const cancelNotif = await Notification.findOne({
        recipient: doctorUser._id,
        type: 'APPOINTMENT_CANCELLED',
      });
      expect(cancelNotif).toBeDefined();
    });
  });

  describe('Invalid State Machine Transitions Rejection', () => {
    it('should reject COMPLETED -> CANCELLED', async () => {
      const appt = await Appointment.create({
        patientId: patientDoc._id,
        doctorId: doctorDoc._id,
        departmentId: department._id,
        date: '2026-11-23',
        startTime: '14:00',
        endTime: '14:30',
        status: 'COMPLETED',
      });

      const res = await request(app)
        .patch(`/api/v1/appointments/${appt._id}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('INVALID_STATUS_TRANSITION');
    });

    it('should reject BOOKED -> COMPLETED (cannot complete without confirming)', async () => {
      const appt = await Appointment.create({
        patientId: patientDoc._id,
        doctorId: doctorDoc._id,
        departmentId: department._id,
        date: '2026-11-24',
        startTime: '15:00',
        endTime: '15:30',
        status: 'BOOKED',
      });

      const res = await request(app)
        .patch(`/api/v1/appointments/${appt._id}/complete`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('INVALID_STATUS_TRANSITION');
    });

    it('should reject non-assigned doctor from confirming another doctor appointment', async () => {
      const appt = await Appointment.create({
        patientId: patientDoc._id,
        doctorId: doctorDoc._id,
        departmentId: department._id,
        date: '2026-11-25',
        startTime: '16:00',
        endTime: '16:30',
        status: 'BOOKED',
      });

      const res = await request(app)
        .patch(`/api/v1/appointments/${appt._id}/confirm`)
        .set('Authorization', `Bearer ${otherDoctorToken}`);

      expect(res.status).toBe(403);
    });
  });
});
