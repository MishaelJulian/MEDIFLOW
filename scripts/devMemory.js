const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');
const { PORT } = require('../src/config/env');
const User = require('../src/models/User');
const Patient = require('../src/models/Patient');
const Department = require('../src/models/Department');
const Doctor = require('../src/models/Doctor');
const DoctorAvailability = require('../src/models/DoctorAvailability');
const { formatDateYYYYMMDD } = require('../src/utils/timeUtils');

const startDevMemoryServer = async () => {
  try {
    console.log('[Dev Memory] Starting in-memory MongoDB instance...');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await connectDB(uri);

    console.log('[Dev Memory] Seeding initial demo data...');
    // Seed Departments
    const departments = await Department.create([
      { name: 'Cardiology', description: 'Comprehensive heart & cardiovascular care.' },
      { name: 'Neurology', description: 'Brain & nervous system disorders.' },
      { name: 'Orthopedics', description: 'Musculoskeletal and joint health.' },
      { name: 'General Medicine', description: 'Primary healthcare and routine checkups.' },
      { name: 'Pediatrics', description: 'Child healthcare and medicine.' },
      { name: 'Dermatology', description: 'Skin care and dermatology.' },
    ]);

    const deptMap = {};
    departments.forEach((d) => (deptMap[d.name] = d._id));

    // Admin
    await User.create({
      name: 'System Administrator',
      email: 'admin@mediflow.com',
      passwordHash: 'Admin@123',
      role: 'ADMIN',
      phone: '+1-555-0100',
    });

    // Receptionist
    await User.create({
      name: 'Central Receptionist',
      email: 'receptionist@mediflow.com',
      passwordHash: 'Recep@123',
      role: 'RECEPTIONIST',
      phone: '+1-555-0101',
    });

    // Doctor 1 (Cardiology)
    const docUser1 = await User.create({
      name: 'Dr. Sarah Smith, MD',
      email: 'dr.smith@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+1-555-0201',
    });

    const doc1 = await Doctor.create({
      userId: docUser1._id,
      departmentId: deptMap['Cardiology'],
      specialization: 'Interventional Cardiology',
      qualifications: ['MBBS', 'MD'],
      experienceYears: 12,
      consultationFee: 150,
      bio: 'Senior cardiologist with over 12 years of clinical experience.',
    });

    // Doctor 2 (Neurology)
    const docUser2 = await User.create({
      name: 'Dr. David Jones, MD',
      email: 'dr.jones@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+1-555-0202',
    });

    const doc2 = await Doctor.create({
      userId: docUser2._id,
      departmentId: deptMap['Neurology'],
      specialization: 'Clinical Neurophysiology',
      qualifications: ['MBBS', 'DM'],
      experienceYears: 9,
      consultationFee: 140,
    });

    // Patient 1
    const pUser1 = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      passwordHash: 'Patient@123',
      role: 'PATIENT',
      phone: '+1-555-0301',
    });

    await Patient.create({
      userId: pUser1._id,
      dob: new Date('1990-05-15'),
      gender: 'MALE',
      bloodGroup: 'O+',
    });

    // Availability next 7 days
    const today = new Date();
    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + dayOffset);
      const dateStr = formatDateYYYYMMDD(targetDate);

      for (const doc of [doc1, doc2]) {
        await DoctorAvailability.create({
          doctorId: doc._id,
          date: dateStr,
          startTime: '09:00',
          endTime: '12:00',
          slotDuration: 30,
        });
        await DoctorAvailability.create({
          doctorId: doc._id,
          date: dateStr,
          startTime: '14:00',
          endTime: '17:00',
          slotDuration: 30,
        });
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(` MediFlow Server Running (In-Memory DB)`);
      console.log(` Port: ${PORT}`);
      console.log(` API Base: http://localhost:${PORT}/api/v1`);
      console.log(` Healthcheck: http://localhost:${PORT}/api/v1/health`);
      console.log(`=========================================`);
      console.log(` Demo Accounts Seeded:`);
      console.log(` - Admin:        admin@mediflow.com    / Admin@123`);
      console.log(` - Doctor (Card):dr.smith@mediflow.com / Doctor@123`);
      console.log(` - Doctor (Neur):dr.jones@mediflow.com / Doctor@123`);
      console.log(` - Patient:      john.doe@example.com  / Patient@123`);
      console.log(`=========================================`);
    });

    const cleanup = async () => {
      console.log('\nStopping memory server...');
      server.close();
      await mongoServer.stop();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } catch (err) {
    console.error(`[Dev Memory Error] ${err.message}`);
    process.exit(1);
  }
};

startDevMemoryServer();
