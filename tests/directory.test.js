const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const Patient = require('../src/models/Patient');
const Department = require('../src/models/Department');
const DoctorAvailability = require('../src/models/DoctorAvailability');

describe('Directory API (Member 2)', () => {
  let patientToken;
  let doctorToken;
  let adminToken;
  let dept1, dept2;
  let doc1, doc2;

  beforeEach(async () => {
    dept1 = await Department.create({ name: 'Pediatrics', description: 'Children healthcare' });
    dept2 = await Department.create({ name: 'Orthopedics', description: 'Bones and joints' });

    // Doctor 1
    const userDoc1 = await User.create({
      name: 'Dr. Sarah Connor',
      email: 'sarah@mediflow.com',
      passwordHash: 'password123',
      role: 'DOCTOR',
    });
    doc1 = await Doctor.create({
      userId: userDoc1._id,
      departmentId: dept1._id,
      specialization: 'Pediatrician',
      qualifications: ['MBBS', 'MD'],
      experienceYears: 8,
      consultationFee: 75,
      isActive: true,
    });
    await DoctorAvailability.create({
      doctorId: doc1._id,
      date: '2026-12-01',
      startTime: '09:00',
      endTime: '12:00',
      slotDurationMinutes: 30,
      isActive: true,
    });

    const docLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'sarah@mediflow.com',
      password: 'password123',
    });
    doctorToken = docLogin.body.data.token;

    // Doctor 2
    const userDoc2 = await User.create({
      name: 'Dr. Tony Stark',
      email: 'tony@mediflow.com',
      passwordHash: 'password123',
      role: 'DOCTOR',
    });
    doc2 = await Doctor.create({
      userId: userDoc2._id,
      departmentId: dept2._id,
      specialization: 'Orthopedic Surgeon',
      experienceYears: 15,
      isActive: true,
    });

    // Patient
    const userPatient = await User.create({
      name: 'Peter Parker',
      email: 'peter@mediflow.com',
      passwordHash: 'password123',
      role: 'PATIENT',
    });
    await Patient.create({
      userId: userPatient._id,
      gender: 'MALE',
      bloodGroup: 'A+',
    });
    const patientLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'peter@mediflow.com',
      password: 'password123',
    });
    patientToken = patientLogin.body.data.token;

    // Admin
    const userAdmin = await User.create({
      name: 'Nick Fury',
      email: 'fury@mediflow.com',
      passwordHash: 'password123',
      role: 'ADMIN',
    });
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'fury@mediflow.com',
      password: 'password123',
    });
    adminToken = adminLogin.body.data.token;
  });

  describe('GET /api/v1/directory/doctors', () => {
    it('should list doctors with specialization, department, and availability summary', async () => {
      const res = await request(app).get('/api/v1/directory/doctors');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);

      const sarah = res.body.data.find((d) => d.name === 'Dr. Sarah Connor');
      expect(sarah).toBeDefined();
      expect(sarah.specialization).toBe('Pediatrician');
      expect(sarah.department.name).toBe('Pediatrics');
      expect(sarah.availabilitySummary.length).toBe(1);
      expect(sarah.availabilitySummary[0].date).toBe('2026-12-01');
    });

    it('should filter doctors by search query', async () => {
      const res = await request(app).get('/api/v1/directory/doctors?search=Stark');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Dr. Tony Stark');
    });
  });

  describe('GET /api/v1/directory/departments', () => {
    it('should return department directory with doctor counts', async () => {
      const res = await request(app).get('/api/v1/directory/departments');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].totalDoctors).toBe(1);
    });
  });

  describe('GET /api/v1/directory/patients (Privacy Test)', () => {
    it('should allow Admin and Doctor to search patient directory', async () => {
      const resAdmin = await request(app)
        .get('/api/v1/directory/patients')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resAdmin.status).toBe(200);
      expect(resAdmin.body.data.length).toBe(1);
      expect(resAdmin.body.data[0].name).toBe('Peter Parker');

      const resDoctor = await request(app)
        .get('/api/v1/directory/patients')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(resDoctor.status).toBe(200);
      expect(resDoctor.body.data.length).toBe(1);
    });

    it('should strictly block Patients from viewing patient directory to preserve privacy', async () => {
      const resPatient = await request(app)
        .get('/api/v1/directory/patients')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(resPatient.status).toBe(403);
      expect(resPatient.body.success).toBe(false);
    });
  });
});
