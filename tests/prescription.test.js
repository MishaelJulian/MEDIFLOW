const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const Patient = require('../src/models/Patient');
const Department = require('../src/models/Department');
const DoctorAvailability = require('../src/models/DoctorAvailability');
const Appointment = require('../src/models/Appointment');
const Prescription = require('../src/models/Prescription');
const Notification = require('../src/models/Notification');

describe('Prescription Module API (Member 2)', () => {
  let doctorToken, doctorUser, doctorDoc;
  let otherDoctorToken, otherDoctorUser, otherDoctorDoc;
  let patientToken, patientUser, patientDoc;
  let otherPatientToken, otherPatientUser, otherPatientDoc;
  let department;
  let appointment;

  beforeEach(async () => {
    // 1. Department
    department = await Department.create({
      name: 'Cardiology',
      description: 'Heart and vascular care',
    });

    // 2. Doctor 1
    doctorUser = await User.create({
      name: 'Dr. Alice Smith',
      email: 'alice@mediflow.com',
      passwordHash: 'password123',
      role: 'DOCTOR',
    });
    doctorDoc = await Doctor.create({
      userId: doctorUser._id,
      departmentId: department._id,
      specialization: 'Cardiologist',
      consultationFee: 100,
    });
    const docLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'alice@mediflow.com',
      password: 'password123',
    });
    doctorToken = docLogin.body.data.token;

    // 3. Doctor 2 (Other Doctor)
    otherDoctorUser = await User.create({
      name: 'Dr. Bob Jones',
      email: 'bob@mediflow.com',
      passwordHash: 'password123',
      role: 'DOCTOR',
    });
    otherDoctorDoc = await Doctor.create({
      userId: otherDoctorUser._id,
      departmentId: department._id,
      specialization: 'Cardiologist',
    });
    const otherDocLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'bob@mediflow.com',
      password: 'password123',
    });
    otherDoctorToken = otherDocLogin.body.data.token;

    // 4. Patient 1
    patientUser = await User.create({
      name: 'John Doe',
      email: 'john@mediflow.com',
      passwordHash: 'password123',
      role: 'PATIENT',
    });
    patientDoc = await Patient.create({
      userId: patientUser._id,
      gender: 'MALE',
      bloodGroup: 'O+',
    });
    const patientLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'john@mediflow.com',
      password: 'password123',
    });
    patientToken = patientLogin.body.data.token;

    // 5. Patient 2
    otherPatientUser = await User.create({
      name: 'Jane Roe',
      email: 'jane@mediflow.com',
      passwordHash: 'password123',
      role: 'PATIENT',
    });
    otherPatientDoc = await Patient.create({
      userId: otherPatientUser._id,
      gender: 'FEMALE',
      bloodGroup: 'A+',
    });
    const otherPatientLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'jane@mediflow.com',
      password: 'password123',
    });
    otherPatientToken = otherPatientLogin.body.data.token;

    // 6. Appointment with Doctor 1 & Patient 1
    appointment = await Appointment.create({
      patientId: patientDoc._id,
      doctorId: doctorDoc._id,
      departmentId: department._id,
      date: '2026-10-15',
      startTime: '10:00',
      endTime: '10:30',
      status: 'CONFIRMED',
      reason: 'Chest pain checkup',
    });
  });

  describe('POST /api/v1/prescriptions', () => {
    it('should allow assigned doctor to create a valid prescription and generate notification for patient', async () => {
      const res = await request(app)
        .post('/api/v1/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId: appointment._id,
          diagnosis: 'Mild hypertension',
          items: [
            {
              medicine: 'Amlodipine',
              dosage: '5mg',
              frequency: 'Once daily',
              duration: '30 days',
              instructions: 'Take in the morning',
            },
          ],
          notes: 'Follow up in 1 month',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.diagnosis).toBe('Mild hypertension');
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].medicine).toBe('Amlodipine');

      // Check notification created
      const notif = await Notification.findOne({ recipient: patientUser._id });
      expect(notif).toBeDefined();
      expect(notif.type).toBe('PRESCRIPTION_AVAILABLE');
    });

    it('should reject prescription creation from non-assigned doctor (wrong doctor)', async () => {
      const res = await request(app)
        .post('/api/v1/prescriptions')
        .set('Authorization', `Bearer ${otherDoctorToken}`)
        .send({
          appointmentId: appointment._id,
          diagnosis: 'Check',
          items: [
            {
              medicine: 'Aspirin',
              dosage: '75mg',
              frequency: 'Once daily',
              duration: '10 days',
            },
          ],
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject prescription creation from patient role', async () => {
      const res = await request(app)
        .post('/api/v1/prescriptions')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          appointmentId: appointment._id,
          diagnosis: 'Self medicate',
          items: [
            {
              medicine: 'Paracetamol',
              dosage: '500mg',
              frequency: 'Twice daily',
              duration: '3 days',
            },
          ],
        });

      expect(res.status).toBe(403);
    });

    it('should reject prescription with empty items array or invalid item fields', async () => {
      const res = await request(app)
        .post('/api/v1/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId: appointment._id,
          diagnosis: 'Cold',
          items: [],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject duplicate prescription for same appointment', async () => {
      await request(app)
        .post('/api/v1/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId: appointment._id,
          diagnosis: 'Initial diagnosis',
          items: [
            {
              medicine: 'Aspirin',
              dosage: '75mg',
              frequency: 'Daily',
              duration: '7 days',
            },
          ],
        });

      const resDuplicate = await request(app)
        .post('/api/v1/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId: appointment._id,
          diagnosis: 'Duplicate attempt',
          items: [
            {
              medicine: 'Aspirin',
              dosage: '75mg',
              frequency: 'Daily',
              duration: '7 days',
            },
          ],
        });

      expect(resDuplicate.status).toBe(409);
      expect(resDuplicate.body.errorCode).toBe('DUPLICATE_PRESCRIPTION');
    });
  });

  describe('GET /api/v1/prescriptions and access control', () => {
    let prescription;

    beforeEach(async () => {
      prescription = await Prescription.create({
        appointmentId: appointment._id,
        doctorId: doctorDoc._id,
        patientId: patientDoc._id,
        diagnosis: 'Hypertension',
        items: [
          {
            medicine: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '14 days',
            instructions: 'Morning with water',
          },
        ],
      });
    });

    it('should allow patient to view own prescription', async () => {
      const res = await request(app)
        .get(`/api/v1/prescriptions/${prescription._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.diagnosis).toBe('Hypertension');
    });

    it('should block another patient from accessing this prescription', async () => {
      const res = await request(app)
        .get(`/api/v1/prescriptions/${prescription._id}`)
        .set('Authorization', `Bearer ${otherPatientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow getting prescription by appointment ID', async () => {
      const res = await request(app)
        .get(`/api/v1/prescriptions/appointment/${appointment._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.appointmentId.date).toBe('2026-10-15');
    });
  });
});
