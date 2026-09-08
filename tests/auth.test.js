const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Patient = require('../src/models/Patient');

describe('Auth & Patient Profile Module (M01)', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a patient and create linked patient profile', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Alice Johnson',
          email: 'alice@example.com',
          password: 'Password@123',
          phone: '+1234567890',
          dob: '1995-03-12',
          gender: 'FEMALE',
          bloodGroup: 'B+',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('alice@example.com');
      expect(res.body.data.user.role).toBe('PATIENT');
      expect(res.body.data.user.passwordHash).toBeUndefined();

      // Check DB
      const patient = await Patient.findOne({ userId: res.body.data.user.id });
      expect(patient).toBeDefined();
      expect(patient.gender).toBe('FEMALE');
      expect(patient.bloodGroup).toBe('B+');
    });

    it('should ignore/prevent role elevation (e.g. attempting to register as ADMIN)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Hacker User',
          email: 'hacker@example.com',
          password: 'Password@123',
          role: 'ADMIN', // Attempted role escalation
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('PATIENT'); // Must remain PATIENT

      const user = await User.findOne({ email: 'hacker@example.com' });
      expect(user.role).toBe('PATIENT');
    });

    it('should reject registration if email is already taken', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Alice Johnson',
          email: 'duplicate@example.com',
          password: 'Password@123',
        });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Another User',
          email: 'duplicate@example.com',
          password: 'Password@456',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('DUPLICATE_RESOURCE');
    });

    it('should fail validation when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: '123', // Too short
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password@123',
        });
    });

    it('should successfully log in with valid credentials and return JWT token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login for inactive user accounts', async () => {
      await User.updateOne({ email: 'john@example.com' }, { isActive: false });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Password@123',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('FORBIDDEN');
    });
  });

  describe('GET & PATCH /api/v1/patients/me', () => {
    let patientToken;

    beforeEach(async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Patient User',
          email: 'patient@example.com',
          password: 'Password@123',
        });
      patientToken = registerRes.body.data.token;
    });

    it('should get own profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/patients/me')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId.email).toBe('patient@example.com');
    });

    it('should update own patient profile', async () => {
      const res = await request(app)
        .patch('/api/v1/patients/me')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          name: 'Updated Patient Name',
          bloodGroup: 'AB+',
          gender: 'MALE',
          medicalNotes: 'No known allergies',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId.name).toBe('Updated Patient Name');
      expect(res.body.data.bloodGroup).toBe('AB+');
      expect(res.body.data.medicalNotes).toBe('No known allergies');
    });

    it('should reject unauthorized access without token', async () => {
      const res = await request(app).get('/api/v1/patients/me');
      expect(res.status).toBe(401);
      expect(res.body.errorCode).toBe('AUTHENTICATION_REQUIRED');
    });
  });
});
