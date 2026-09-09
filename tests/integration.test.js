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
const Invoice = require('../src/models/Invoice');

describe('Member 4 — End-to-End System Integration & Contract Verification (M14)', () => {
  const targetDate = '2028-12-15';
  const targetSlotTime = '10:00';

  describe('Full Cross-Module Lifecycle Journey', () => {
    it('should complete the entire Patient -> Doctor -> Patient -> Admin workflow seamlessly', async () => {
      // 0. Setup Department & Doctor
      const department = await Department.create({
        name: 'Cardiology',
        description: 'Cardiovascular diagnostics and interventions',
        isActive: true,
      });

      const doctorUser = await User.create({
        name: 'Dr. Gregory House, MD',
        email: 'dr.house.e2e@mediflow.com',
        passwordHash: 'Doctor@123',
        role: 'DOCTOR',
        isActive: true,
      });

      const doctorDoc = await Doctor.create({
        userId: doctorUser._id,
        departmentId: department._id,
        specialization: 'Cardiology',
        consultationFee: 150,
        isActive: true,
      });

      await DoctorAvailability.create({
        doctorId: doctorDoc._id,
        date: targetDate,
        startTime: '09:00',
        endTime: '13:00',
        slotDuration: 30,
        isActive: true,
      });

      const adminUser = await User.create({
        name: 'Head Administrator',
        email: 'admin.lead.e2e@mediflow.com',
        passwordHash: 'Admin@123',
        role: 'ADMIN',
        isActive: true,
      });

      // 1. PATIENT: Registration & Login
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Arthur Dent',
          email: 'arthur.dent@example.com',
          password: 'Password@123',
          phone: '+1-555-0999',
          gender: 'MALE',
        });
      expect(registerRes.status).toBe(201);
      expect(registerRes.body.success).toBe(true);

      const patientLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'arthur.dent@example.com',
          password: 'Password@123',
        });
      expect(patientLoginRes.status).toBe(200);
      const patientToken = patientLoginRes.body.data.token;
      const patientId = registerRes.body.data.patient._id;

      // 2. PATIENT: Doctor Discovery & Availability Lookup
      const directoryRes = await request(app)
        .get('/api/v1/directory/doctors')
        .query({ specialization: 'Cardiology' });
      expect(directoryRes.status).toBe(200);
      expect(directoryRes.body.data.length).toBeGreaterThan(0);

      const availRes = await request(app)
        .get(`/api/v1/doctors/${doctorDoc._id}/availability`)
        .query({ date: targetDate });
      expect(availRes.status).toBe(200);
      expect(availRes.body.data.length).toBeGreaterThan(0);

      // 3. PATIENT: Booking Appointment
      const bookRes = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctorDoc._id.toString(),
          departmentId: department._id.toString(),
          date: targetDate,
          startTime: targetSlotTime,
          endTime: '10:30',
          reason: 'Occasional palpitations during exertion',
        });
      expect(bookRes.status).toBe(201);
      expect(bookRes.body.data.status).toBe('BOOKED');
      const appointmentId = bookRes.body.data._id;

      // 4. CONFLICT PREVENTION: Re-booking exact same slot must return 409
      const conflictRes = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctorDoc._id.toString(),
          departmentId: department._id.toString(),
          date: targetDate,
          startTime: targetSlotTime,
          endTime: '10:30',
          reason: 'Duplicate slot booking attempt',
        });
      expect(conflictRes.status).toBe(409);
      expect(conflictRes.body.errorCode).toBe('SLOT_CONFLICT');

      // 5. DOCTOR: Login & Fetch Queue
      const docLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'dr.house.e2e@mediflow.com',
          password: 'Doctor@123',
        });
      expect(docLoginRes.status).toBe(200);
      const doctorToken = docLoginRes.body.data.token;

      const docQueueRes = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(docQueueRes.status).toBe(200);
      expect(docQueueRes.body.data.some((a) => a._id.toString() === appointmentId)).toBe(true);

      // 6. DOCTOR: Confirm Appointment (BOOKED -> CONFIRMED)
      const confirmRes = await request(app)
        .patch(`/api/v1/appointments/${appointmentId}/confirm`)
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.status).toBe('CONFIRMED');

      // 7. DOCTOR: Complete Consultation (CONFIRMED -> COMPLETED)
      const completeRes = await request(app)
        .patch(`/api/v1/appointments/${appointmentId}/complete`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ clinicalNotes: 'Cardiac examination unremarkable.' });
      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.status).toBe('COMPLETED');

      // 8. DOCTOR: Issue Prescription
      const rxRes = await request(app)
        .post('/api/v1/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId,
          diagnosis: 'Benign Premature Ventricular Contractions',
          items: [
            {
              medicine: 'Metoprolol Tartrate',
              dosage: '25mg',
              frequency: 'Twice daily',
              duration: '14 days',
              instructions: 'Take with food',
            },
          ],
          generalAdvice: 'Limit caffeine. Keep symptom diary.',
        });
      expect(rxRes.status).toBe(201);
      const prescriptionId = rxRes.body.data._id;

      // 9. PATIENT: View Prescription
      const myRxRes = await request(app)
        .get('/api/v1/prescriptions')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(myRxRes.status).toBe(200);
      const foundRx = myRxRes.body.data.find((rx) => rx._id.toString() === prescriptionId);
      expect(foundRx).toBeDefined();
      expect(foundRx.items[0].medicine).toBe('Metoprolol Tartrate');

      // 10. PATIENT: Check & Acknowledge Notifications
      const notifRes = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(notifRes.status).toBe(200);
      expect(notifRes.body.data.length).toBeGreaterThan(0);

      const unreadNotif = notifRes.body.data[0];
      const readRes = await request(app)
        .patch(`/api/v1/notifications/${unreadNotif._id}/read`)
        .set('Authorization', `Bearer ${patientToken}`);
      expect(readRes.status).toBe(200);
      expect(readRes.body.data.isRead).toBe(true);

      // 11. BILLING: Invoice Creation & Patient Settlement
      const invRes = await request(app)
        .post('/api/v1/billing')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId,
          lineItems: [{ description: 'Cardiology Consultation', amount: 150, quantity: 1 }],
        });
      expect(invRes.status).toBe(201);
      const invoiceId = invRes.body.data._id;

      const myInvoicesRes = await request(app)
        .get('/api/v1/billing/my-invoices')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(myInvoicesRes.status).toBe(200);
      expect(myInvoicesRes.body.data.some((inv) => inv._id.toString() === invoiceId)).toBe(true);

      const payRes = await request(app)
        .post(`/api/v1/billing/${invoiceId}/pay`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ paymentMethod: 'ONLINE_SIMULATION' });
      expect(payRes.status).toBe(200);
      expect(payRes.body.data.paymentStatus).toBe('PAID');

      // 12. ADMIN: Login & Oversight Summary & AI Risk Assessment
      const adminLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin.lead.e2e@mediflow.com',
          password: 'Admin@123',
        });
      expect(adminLoginRes.status).toBe(200);
      const adminToken = adminLoginRes.body.data.token;

      const dashboardRes = await request(app)
        .get('/api/v1/analytics/dashboard-summary')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(dashboardRes.status).toBe(200);
      expect(dashboardRes.body.data.summary.totalAppointments).toBeGreaterThan(0);
      expect(dashboardRes.body.data.summary.totalRevenue).toBeGreaterThanOrEqual(150);

      const riskRes = await request(app)
        .get(`/api/v1/analytics/no-show-risk/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(riskRes.status).toBe(200);
      expect(riskRes.body.data).toHaveProperty('riskLevel');
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(riskRes.body.data.riskLevel);
    });
  });

  describe('Contract Verification & Security Assertions', () => {
    it('should return standard success envelope structure', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message');
    });

    it('should return standard error envelope with machine readable code', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'ghost@mediflow.com', password: 'InvalidPassword' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('errorCode');
    });

    it('should enforce RBAC: patient is blocked from admin dashboard summary', async () => {
      const patientUser = await User.create({
        name: 'Patient Test',
        email: 'patient.rbac@example.com',
        passwordHash: 'Password@123',
        role: 'PATIENT',
      });
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'patient.rbac@example.com', password: 'Password@123' });

      const res = await request(app)
        .get('/api/v1/analytics/dashboard-summary')
        .set('Authorization', `Bearer ${loginRes.body.data.token}`);
      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe('FORBIDDEN');
    });

    it('should enforce ownership: patient cannot access invoice belonging to another patient', async () => {
      const patient1User = await User.create({
        name: 'Patient One',
        email: 'p1@example.com',
        passwordHash: 'Pass@123',
        role: 'PATIENT',
      });
      const p1 = await Patient.create({ userId: patient1User._id, gender: 'MALE' });

      const patient2User = await User.create({
        name: 'Patient Two',
        email: 'p2@example.com',
        passwordHash: 'Pass@123',
        role: 'PATIENT',
      });
      await Patient.create({ userId: patient2User._id, gender: 'FEMALE' });

      const dept = await Department.create({ name: 'General', description: 'Primary' });
      const appt = await Appointment.create({
        patientId: p1._id,
        doctorId: (await User.create({ name: 'Doc', email: 'doc.test@example.com', passwordHash: 'Pass@123', role: 'DOCTOR' }))._id,
        departmentId: dept._id,
        date: '2028-11-10',
        startTime: '10:00',
        endTime: '10:30',
        status: 'BOOKED',
      });

      const invoice = await Invoice.create({
        invoiceNumber: 'INV-TEST-999',
        appointmentId: appt._id,
        patientId: p1._id,
        subtotal: 100,
        total: 100,
        paymentStatus: 'PENDING',
      });

      const p2Login = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'p2@example.com', password: 'Pass@123' });

      const res = await request(app)
        .get(`/api/v1/billing/${invoice._id}`)
        .set('Authorization', `Bearer ${p2Login.body.data.token}`);

      expect(res.status).toBe(403);
    });

    it('5.5 should serve frontend Single Page Application and static assets', async () => {
      const htmlRes = await request(app).get('/');
      expect(htmlRes.status).toBe(200);
      expect(htmlRes.text).toContain('MediFlow');

      const cssRes = await request(app).get('/css/styles.css');
      expect(cssRes.status).toBe(200);
      expect(cssRes.headers['content-type']).toContain('css');

      const jsRes = await request(app).get('/js/app.js');
      expect(jsRes.status).toBe(200);
      expect(jsRes.headers['content-type']).toContain('javascript');
    });
  });
});
