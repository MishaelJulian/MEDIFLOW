const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const Patient = require('../src/models/Patient');
const Department = require('../src/models/Department');
const Appointment = require('../src/models/Appointment');
const Prescription = require('../src/models/Prescription');

describe('Medical History API (Member 2)', () => {
  let patientToken, patientUser, patientDoc;
  let otherPatientToken, otherPatientUser, otherPatientDoc;
  let doctorToken, doctorUser, doctorDoc;
  let adminToken;
  let department;

  beforeEach(async () => {
    department = await Department.create({
      name: 'Neurology',
      description: 'Nervous system treatments',
    });

    doctorUser = await User.create({
      name: 'Dr. Strange',
      email: 'strange@mediflow.com',
      passwordHash: 'password123',
      role: 'DOCTOR',
    });
    doctorDoc = await Doctor.create({
      userId: doctorUser._id,
      departmentId: department._id,
      specialization: 'Neurosurgeon',
    });
    const docLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'strange@mediflow.com',
      password: 'password123',
    });
    doctorToken = docLogin.body.data.token;

    patientUser = await User.create({
      name: 'Bruce Wayne',
      email: 'bruce@mediflow.com',
      passwordHash: 'password123',
      role: 'PATIENT',
    });
    patientDoc = await Patient.create({
      userId: patientUser._id,
      bloodGroup: 'O+',
      medicalNotes: 'Prior concussion',
    });
    const patientLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'bruce@mediflow.com',
      password: 'password123',
    });
    patientToken = patientLogin.body.data.token;

    otherPatientUser = await User.create({
      name: 'Clark Kent',
      email: 'clark@mediflow.com',
      passwordHash: 'password123',
      role: 'PATIENT',
    });
    otherPatientDoc = await Patient.create({
      userId: otherPatientUser._id,
      bloodGroup: 'AB+',
    });
    const otherPatientLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'clark@mediflow.com',
      password: 'password123',
    });
    otherPatientToken = otherPatientLogin.body.data.token;

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin_med@mediflow.com',
      passwordHash: 'password123',
      role: 'ADMIN',
    });
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin_med@mediflow.com',
      password: 'password123',
    });
    adminToken = adminLogin.body.data.token;

    // Create 1 completed appointment with prescription
    const appt = await Appointment.create({
      patientId: patientDoc._id,
      doctorId: doctorDoc._id,
      departmentId: department._id,
      date: '2026-09-01',
      startTime: '10:00',
      endTime: '10:30',
      status: 'COMPLETED',
      reason: 'Migraine',
    });

    await Prescription.create({
      appointmentId: appt._id,
      doctorId: doctorDoc._id,
      patientId: patientDoc._id,
      diagnosis: 'Tension headache',
      items: [
        {
          medicine: 'Sumatriptan',
          dosage: '50mg',
          frequency: 'As needed',
          duration: '5 days',
        },
      ],
    });
  });

  describe('GET /api/v1/medical-history/me', () => {
    it('should allow patient to retrieve their own full medical history', async () => {
      const res = await request(app)
        .get('/api/v1/medical-history/me')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.patient.name).toBe('Bruce Wayne');
      expect(res.body.data.summary.totalAppointments).toBe(1);
      expect(res.body.data.summary.completedConsultations).toBe(1);
      expect(res.body.data.summary.totalPrescriptions).toBe(1);
      expect(res.body.data.encounters[0].prescription.diagnosis).toBe('Tension headache');
    });
  });

  describe('GET /api/v1/medical-history/:id', () => {
    it('should allow doctor to view a patient medical history for clinical care', async () => {
      const res = await request(app)
        .get(`/api/v1/medical-history/${patientDoc._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.patient.name).toBe('Bruce Wayne');
    });

    it('should block unauthorized patient from viewing another patient medical history', async () => {
      const res = await request(app)
        .get(`/api/v1/medical-history/${patientDoc._id}`)
        .set('Authorization', `Bearer ${otherPatientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
