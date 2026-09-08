const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Doctor = require('../src/models/Doctor');
const { generateToken } = require('../src/utils/token');

describe('Department Module (M02)', () => {
  let adminToken;
  let patientToken;

  beforeEach(async () => {
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash: 'Admin@123',
      role: 'ADMIN',
    });
    adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

    const patientUser = await User.create({
      name: 'Patient User',
      email: 'patient@test.com',
      passwordHash: 'Patient@123',
      role: 'PATIENT',
    });
    patientToken = generateToken({ id: patientUser._id, role: patientUser.role });
  });

  describe('POST /api/v1/departments', () => {
    it('should allow ADMIN to create a department', async () => {
      const res = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Cardiology',
          description: 'Heart and cardiovascular care',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Cardiology');
    });

    it('should reject non-admin (PATIENT) from creating department', async () => {
      const res = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          name: 'Neurology',
        });

      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe('FORBIDDEN');
    });

    it('should reject duplicate department names', async () => {
      await request(app)
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Cardiology' });

      const res = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'cardiology' }); // Case insensitive match

      expect(res.status).toBe(409);
      expect(res.body.errorCode).toBe('DUPLICATE_RESOURCE');
    });
  });

  describe('GET /api/v1/departments', () => {
    it('should list all active departments', async () => {
      await Department.create([
        { name: 'Cardiology', isActive: true },
        { name: 'Neurology', isActive: true },
        { name: 'Inactive Dept', isActive: false },
      ]);

      const res = await request(app).get('/api/v1/departments?isActive=true');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('DELETE /api/v1/departments/:id', () => {
    it('should prevent deactivating department if active doctors are assigned', async () => {
      const dept = await Department.create({ name: 'Orthopedics', isActive: true });
      const docUser = await User.create({
        name: 'Doctor User',
        email: 'doc@test.com',
        passwordHash: 'Doc@123',
        role: 'DOCTOR',
      });
      await Doctor.create({
        userId: docUser._id,
        departmentId: dept._id,
        specialization: 'Surgeon',
        isActive: true,
      });

      const res = await request(app)
        .delete(`/api/v1/departments/${dept._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('BUSINESS_RULE_VIOLATION');
    });
  });
});
