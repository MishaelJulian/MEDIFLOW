const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Patient = require('../src/models/Patient');
const Department = require('../src/models/Department');
const Doctor = require('../src/models/Doctor');
const DoctorAvailability = require('../src/models/DoctorAvailability');
const Appointment = require('../src/models/Appointment');
const { generateToken } = require('../src/utils/token');

describe('Appointment Booking Engine Module (M04)', () => {
  let patientToken;
  let patient2Token;
  let docToken;
  let doctor;
  let patient1;
  let patient2;
  const futureDate = '2028-10-15'; // Far future date

  beforeEach(async () => {
    const dept = await Department.create({ name: 'Cardiology', isActive: true });

    // Doctor
    const docUser = await User.create({
      name: 'Dr. Sarah Smith',
      email: 'dr.smith@test.com',
      passwordHash: 'Doc@123',
      role: 'DOCTOR',
    });
    docToken = generateToken({ id: docUser._id, role: docUser.role });
    doctor = await Doctor.create({
      userId: docUser._id,
      departmentId: dept._id,
      specialization: 'Cardiologist',
      isActive: true,
    });

    // Doctor availability
    await DoctorAvailability.create({
      doctorId: doctor._id,
      date: futureDate,
      startTime: '10:00',
      endTime: '13:00',
      slotDuration: 30,
      isActive: true,
    });

    // Patient 1
    const patientUser1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@test.com',
      passwordHash: 'Patient@123',
      role: 'PATIENT',
    });
    patientToken = generateToken({ id: patientUser1._id, role: patientUser1.role });
    patient1 = await Patient.create({
      userId: patientUser1._id,
      dob: new Date('1992-01-01'),
      gender: 'FEMALE',
    });

    // Patient 2
    const patientUser2 = await User.create({
      name: 'Bob Williams',
      email: 'bob@test.com',
      passwordHash: 'Patient@123',
      role: 'PATIENT',
    });
    patient2Token = generateToken({ id: patientUser2._id, role: patientUser2.role });
    patient2 = await Patient.create({
      userId: patientUser2._id,
      dob: new Date('1988-06-15'),
      gender: 'MALE',
    });
  });

  describe('POST /api/v1/appointments (Booking Engine)', () => {
    it('TC-APPT-001: should successfully book a valid appointment within doctor availability', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctor._id,
          date: futureDate,
          startTime: '10:00',
          endTime: '10:30',
          reason: 'Routine checkup',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('BOOKED');
      expect(res.body.data.date).toBe(futureDate);
      expect(res.body.data.startTime).toBe('10:00');
      expect(res.body.data.endTime).toBe('10:30');
      expect(res.body.data.slotKey).toBe(`${doctor._id}_${futureDate}_10:00`);
    });

    it('TC-APPT-002: should reject booking when slot is outside doctor availability', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctor._id,
          date: futureDate,
          startTime: '14:00', // Doctor availability is 10:00-13:00
          endTime: '14:30',
        });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('BUSINESS_RULE_VIOLATION');
    });

    it('TC-APPT-003: should reject duplicate/overlapping booking for same doctor slot (Conflict Prevention)', async () => {
      // Patient 1 books 10:00 - 10:30
      await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctor._id,
          date: futureDate,
          startTime: '10:00',
          endTime: '10:30',
        });

      // Patient 2 attempts same slot (10:00 - 10:30)
      const resDuplicate = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patient2Token}`)
        .send({
          doctorId: doctor._id,
          date: futureDate,
          startTime: '10:00',
          endTime: '10:30',
        });

      expect(resDuplicate.status).toBe(409);
      expect(resDuplicate.body.errorCode).toBe('SLOT_CONFLICT');

      // Patient 2 attempts overlapping slot (10:15 - 10:45)
      const resOverlap = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patient2Token}`)
        .send({
          doctorId: doctor._id,
          date: futureDate,
          startTime: '10:15',
          endTime: '10:45',
        });

      expect(resOverlap.status).toBe(409);
      expect(resOverlap.body.errorCode).toBe('SLOT_CONFLICT');
    });

    it('TC-APPT-004: should reject if patient attempts to double-book self across different doctors at same time', async () => {
      const docUser2 = await User.create({
        name: 'Dr. John',
        email: 'john.doc@test.com',
        passwordHash: 'Doc@123',
        role: 'DOCTOR',
      });
      const doctor2 = await Doctor.create({
        userId: docUser2._id,
        departmentId: doctor.departmentId,
        specialization: 'Surgeon',
        isActive: true,
      });
      await DoctorAvailability.create({
        doctorId: doctor2._id,
        date: futureDate,
        startTime: '10:00',
        endTime: '13:00',
        isActive: true,
      });

      // Patient 1 books doctor 1 at 10:00 - 10:30
      await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctor._id,
          date: futureDate,
          startTime: '10:00',
          endTime: '10:30',
        });

      // Patient 1 attempts to book doctor 2 at 10:00 - 10:30
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctor2._id,
          date: futureDate,
          startTime: '10:00',
          endTime: '10:30',
        });

      expect(res.status).toBe(409);
      expect(res.body.errorCode).toBe('SLOT_CONFLICT');
    });

    it('TC-APPT-005: should reject booking for inactive doctor', async () => {
      await Doctor.findByIdAndUpdate(doctor._id, { isActive: false });

      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctor._id,
          date: futureDate,
          startTime: '10:00',
          endTime: '10:30',
        });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('BUSINESS_RULE_VIOLATION');
    });

    it('should reject booking in the past', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctor._id,
          date: '2020-01-01',
          startTime: '10:00',
          endTime: '10:30',
        });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('BUSINESS_RULE_VIOLATION');
    });
  });

  describe('GET /api/v1/appointments', () => {
    it('should scope appointments: patient sees only own appointments', async () => {
      await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctor._id,
          date: futureDate,
          startTime: '10:00',
          endTime: '10:30',
        });

      await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patient2Token}`)
        .send({
          doctorId: doctor._id,
          date: futureDate,
          startTime: '11:00',
          endTime: '11:30',
        });

      const res = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].startTime).toBe('10:00');
    });
  });

  describe('PATCH /api/v1/appointments/:id/cancel', () => {
    let appointmentId;

    beforeEach(async () => {
      const bookRes = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctor._id,
          date: futureDate,
          startTime: '10:00',
          endTime: '10:30',
        });
      appointmentId = bookRes.body.data._id;
    });

    it('should allow patient to cancel own booked appointment and free the slot', async () => {
      const cancelRes = await request(app)
        .patch(`/api/v1/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ reason: 'Personal conflict' });

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe('CANCELLED');
      expect(cancelRes.body.data.slotKey).toBeNull();

      // Now Patient 2 should be able to book this previously cancelled slot
      const rebookRes = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patient2Token}`)
        .send({
          doctorId: doctor._id,
          date: futureDate,
          startTime: '10:00',
          endTime: '10:30',
        });

      expect(rebookRes.status).toBe(201);
      expect(rebookRes.body.data.status).toBe('BOOKED');
    });

    it('should reject another patient from cancelling someone else appointment', async () => {
      const res = await request(app)
        .patch(`/api/v1/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${patient2Token}`)
        .send({ reason: 'Unauthorized cancellation attempt' });

      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe('FORBIDDEN');
    });
  });
});
