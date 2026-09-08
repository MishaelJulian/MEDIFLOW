const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Doctor = require('../src/models/Doctor');
const { generateToken } = require('../src/utils/token');

describe('Doctor Module (M02)', () => {
  let adminToken;
  let docToken;
  let department;
  let doctorUser;

  beforeEach(async () => {
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash: 'Admin@123',
      role: 'ADMIN',
    });
    adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    department = await Department.create({
      name: 'Cardiology',
      description: 'Heart care',
      isActive: true,
    });

    doctorUser = await User.create({
      name: 'Dr. Sarah Smith',
      email: 'dr.smith@test.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
    });
    docToken = generateToken({ id: doctorUser._id, role: doctorUser.role });
  });

  describe('POST /api/v1/doctors', () => {
    it('should create doctor profile when valid DOCTOR user and department are linked', async () => {
      const res = await request(app)
        .post('/api/v1/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: doctorUser._id,
          departmentId: department._id,
          specialization: 'Cardiologist',
          qualifications: ['MBBS', 'MD'],
          experienceYears: 10,
          consultationFee: 150,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.specialization).toBe('Cardiologist');
      expect(res.body.data.userId.name).toBe('Dr. Sarah Smith');
    });

    it('should reject creating doctor profile for a user with PATIENT role', async () => {
      const patientUser = await User.create({
        name: 'Patient User',
        email: 'patient@test.com',
        passwordHash: 'Patient@123',
        role: 'PATIENT',
      });

      const res = await request(app)
        .post('/api/v1/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: patientUser._id,
          departmentId: department._id,
          specialization: 'Surgeon',
        });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('BUSINESS_RULE_VIOLATION');
    });

    it('should reject creating duplicate doctor profile for the same user', async () => {
      await Doctor.create({
        userId: doctorUser._id,
        departmentId: department._id,
        specialization: 'Cardiologist',
      });

      const res = await request(app)
        .post('/api/v1/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: doctorUser._id,
          departmentId: department._id,
          specialization: 'Cardiologist',
        });

      expect(res.status).toBe(409);
      expect(res.body.errorCode).toBe('DUPLICATE_RESOURCE');
    });
  });

  describe('GET /api/v1/doctors', () => {
    beforeEach(async () => {
      await Doctor.create({
        userId: doctorUser._id,
        departmentId: department._id,
        specialization: 'Cardiologist',
        isActive: true,
      });
    });

    it('should list doctors and filter by department', async () => {
      const res = await request(app).get('/api/v1/doctors?department=Cardiology');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].specialization).toBe('Cardiologist');
    });

    it('should filter doctors by specialization', async () => {
      const res = await request(app).get('/api/v1/doctors?specialization=cardio');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });
});
