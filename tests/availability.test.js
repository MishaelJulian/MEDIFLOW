const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Doctor = require('../src/models/Doctor');
const { generateToken } = require('../src/utils/token');

describe('Doctor Availability Module (M03)', () => {
  let docToken;
  let otherDocToken;
  let doctor;
  let otherDoctor;

  beforeEach(async () => {
    const dept = await Department.create({ name: 'General Medicine', isActive: true });

    const docUser = await User.create({
      name: 'Dr. Sarah',
      email: 'sarah@test.com',
      passwordHash: 'Doc@123',
      role: 'DOCTOR',
    });
    docToken = generateToken({ id: docUser._id, role: docUser.role });
    doctor = await Doctor.create({
      userId: docUser._id,
      departmentId: dept._id,
      specialization: 'Physician',
      isActive: true,
    });

    const otherUser = await User.create({
      name: 'Dr. John',
      email: 'john@test.com',
      passwordHash: 'Doc@123',
      role: 'DOCTOR',
    });
    otherDocToken = generateToken({ id: otherUser._id, role: otherUser.role });
    otherDoctor = await Doctor.create({
      userId: otherUser._id,
      departmentId: dept._id,
      specialization: 'Surgeon',
      isActive: true,
    });
  });

  describe('POST /api/v1/doctors/:id/availability', () => {
    it('should allow doctor to set own availability', async () => {
      const res = await request(app)
        .post(`/api/v1/doctors/${doctor._id}/availability`)
        .set('Authorization', `Bearer ${docToken}`)
        .send({
          date: '2026-09-15',
          startTime: '09:00',
          endTime: '12:00',
          slotDuration: 30,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.startTime).toBe('09:00');
      expect(res.body.data.endTime).toBe('12:00');
    });

    it('should reject when startTime >= endTime (Rule: start must precede end)', async () => {
      const res = await request(app)
        .post(`/api/v1/doctors/${doctor._id}/availability`)
        .set('Authorization', `Bearer ${docToken}`)
        .send({
          date: '2026-09-15',
          startTime: '12:00',
          endTime: '10:00', // Invalid
        });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('BUSINESS_RULE_VIOLATION');
    });

    it('should reject overlapping availability windows for the same doctor on the same date', async () => {
      await request(app)
        .post(`/api/v1/doctors/${doctor._id}/availability`)
        .set('Authorization', `Bearer ${docToken}`)
        .send({
          date: '2026-09-15',
          startTime: '10:00',
          endTime: '12:00',
        });

      const res = await request(app)
        .post(`/api/v1/doctors/${doctor._id}/availability`)
        .set('Authorization', `Bearer ${docToken}`)
        .send({
          date: '2026-09-15',
          startTime: '11:00', // Overlaps with 10:00-12:00
          endTime: '13:00',
        });

      expect(res.status).toBe(409);
      expect(res.body.errorCode).toBe('SLOT_CONFLICT');
    });

    it('should prevent doctor from modifying another doctor availability', async () => {
      const res = await request(app)
        .post(`/api/v1/doctors/${doctor._id}/availability`)
        .set('Authorization', `Bearer ${otherDocToken}`)
        .send({
          date: '2026-09-15',
          startTime: '09:00',
          endTime: '12:00',
        });

      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/v1/doctors/:id/available-slots', () => {
    it('should calculate discrete 30-min available slots correctly', async () => {
      await request(app)
        .post(`/api/v1/doctors/${doctor._id}/availability`)
        .set('Authorization', `Bearer ${docToken}`)
        .send({
          date: '2026-09-20',
          startTime: '09:00',
          endTime: '11:00',
          slotDuration: 30,
        });

      const res = await request(app).get(`/api/v1/doctors/${doctor._id}/available-slots?date=2026-09-20`);

      expect(res.status).toBe(200);
      expect(res.body.data.availableSlots.length).toBe(4); // 09:00-09:30, 09:30-10:00, 10:00-10:30, 10:30-11:00
      expect(res.body.data.availableSlots[0]).toEqual({ startTime: '09:00', endTime: '09:30' });
    });
  });
});
