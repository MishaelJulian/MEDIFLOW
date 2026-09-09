const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');
const { PORT } = require('../src/config/env');
const User = require('../src/models/User');
const Patient = require('../src/models/Patient');
const Department = require('../src/models/Department');
const Doctor = require('../src/models/Doctor');
const DoctorAvailability = require('../src/models/DoctorAvailability');
const Appointment = require('../src/models/Appointment');
const Prescription = require('../src/models/Prescription');
const Notification = require('../src/models/Notification');
const Invoice = require('../src/models/Invoice');
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
      phone: '+91-98765-43201',
    });
    const doc1 = await Doctor.create({
      userId: docUser1._id,
      departmentId: deptMap['Cardiology'],
      specialization: 'Interventional Cardiology',
      qualifications: ['MBBS', 'MD'],
      experienceYears: 12,
      consultationFee: 800,
      bio: 'Senior cardiologist with over 12 years of clinical experience in coronary interventions and heart failure.',
    });

    // Doctor 2 (Neurology)
    const docUser2 = await User.create({
      name: 'Dr. David Jones, MD',
      email: 'dr.jones@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43202',
    });
    const doc2 = await Doctor.create({
      userId: docUser2._id,
      departmentId: deptMap['Neurology'],
      specialization: 'Clinical Neurophysiology',
      qualifications: ['MBBS', 'DM'],
      experienceYears: 9,
      consultationFee: 900,
      bio: 'Expert neurologist specializing in headache management, stroke rehabilitation, and epilepsy.',
    });

    // Doctor 3 (Orthopedics)
    const docUser3 = await User.create({
      name: 'Dr. Anita Patel, MS',
      email: 'dr.patel@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43203',
    });
    const doc3 = await Doctor.create({
      userId: docUser3._id,
      departmentId: deptMap['Orthopedics'],
      specialization: 'Joint Replacement & Sports Medicine',
      qualifications: ['MBBS', 'MS (Orthopedics)'],
      experienceYears: 8,
      consultationFee: 750,
      bio: 'Orthopedic specialist in robotic knee replacement and minimally invasive arthroscopic surgeries.',
    });

    // Doctor 4 (General Medicine)
    const docUser4 = await User.create({
      name: 'Dr. Rajesh Sharma, MD',
      email: 'dr.sharma@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43204',
    });
    const doc4 = await Doctor.create({
      userId: docUser4._id,
      departmentId: deptMap['General Medicine'],
      specialization: 'Internal Medicine & Diabetology',
      qualifications: ['MBBS', 'MD (General Medicine)'],
      experienceYears: 15,
      consultationFee: 500,
      bio: 'Consultant physician with extensive expertise in preventive healthcare, hypertension, and diabetes management.',
    });

    // Doctor 5 (Pediatrics)
    const docUser5 = await User.create({
      name: 'Dr. Priya Nair, MD',
      email: 'dr.nair@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43205',
    });
    const doc5 = await Doctor.create({
      userId: docUser5._id,
      departmentId: deptMap['Pediatrics'],
      specialization: 'Child Healthcare & Neonatology',
      qualifications: ['MBBS', 'DCH', 'MD (Pediatrics)'],
      experienceYears: 10,
      consultationFee: 600,
      bio: 'Compassionate pediatrician focusing on developmental milestones, vaccinations, and pediatric emergency care.',
    });

    // Doctor 6 (Dermatology)
    const docUser6 = await User.create({
      name: 'Dr. Vikram Malhotra, MD',
      email: 'dr.malhotra@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43206',
    });
    const doc6 = await Doctor.create({
      userId: docUser6._id,
      departmentId: deptMap['Dermatology'],
      specialization: 'Clinical & Aesthetic Dermatology',
      qualifications: ['MBBS', 'MD (Dermatology)'],
      experienceYears: 11,
      consultationFee: 700,
      bio: 'Specialist in clinical dermatology, laser skin therapies, acne treatments, and hair restoration.',
    });

    // Doctor 7 (Cardiology)
    const docUser7 = await User.create({
      name: 'Dr. Ananya Sen, DM',
      email: 'dr.sen@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43207',
    });
    const doc7 = await Doctor.create({
      userId: docUser7._id,
      departmentId: deptMap['Cardiology'],
      specialization: 'Cardiac Electrophysiology & Arrhythmia',
      qualifications: ['MBBS', 'MD', 'DM (Cardiology)'],
      experienceYears: 7,
      consultationFee: 850,
      bio: 'Cardiology specialist focusing on cardiac pacing, electrophysiology studies, and arrhythmia ablation.',
    });

    // Doctor 8 (Orthopedics)
    const docUser8 = await User.create({
      name: 'Dr. Rohan Mehta, MCh',
      email: 'dr.mehta@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43208',
    });
    const doc8 = await Doctor.create({
      userId: docUser8._id,
      departmentId: deptMap['Orthopedics'],
      specialization: 'Spine Surgery & Trauma',
      qualifications: ['MBBS', 'MS (Ortho)', 'MCh (Orthopedics)'],
      experienceYears: 14,
      consultationFee: 800,
      bio: 'Renowned spine surgeon specializing in endoscopic spine surgery, disc replacements, and complex trauma care.',
    });

    // Doctor 9 (Neurology)
    const docUser9 = await User.create({
      name: 'Dr. Suresh Iyer, DM',
      email: 'dr.iyer@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43209',
    });
    const doc9 = await Doctor.create({
      userId: docUser9._id,
      departmentId: deptMap['Neurology'],
      specialization: 'Cognitive Neurology & Dementia',
      qualifications: ['MBBS', 'MD', 'DM (Neurology)'],
      experienceYears: 13,
      consultationFee: 950,
      bio: 'Specialist in memory disorders, cognitive rehabilitation, and neuro-degenerative illness management.',
    });

    // Doctor 10 (General Medicine)
    const docUser10 = await User.create({
      name: 'Dr. Neha Gupta, MD',
      email: 'dr.gupta@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43210',
    });
    const doc10 = await Doctor.create({
      userId: docUser10._id,
      departmentId: deptMap['General Medicine'],
      specialization: 'Geriatric & Infectious Diseases',
      qualifications: ['MBBS', 'MD (Internal Medicine)'],
      experienceYears: 9,
      consultationFee: 550,
      bio: 'Dedicated internist with deep expertise in geriatric healthcare, chronic lifestyle illnesses, and seasonal infections.',
    });

    // Doctor 11 (Pediatrics)
    const docUser11 = await User.create({
      name: 'Dr. Arjun Kapoor, MD',
      email: 'dr.kapoor@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43211',
    });
    const doc11 = await Doctor.create({
      userId: docUser11._id,
      departmentId: deptMap['Pediatrics'],
      specialization: 'Pediatric Pulmonology & Allergy',
      qualifications: ['MBBS', 'MD (Pediatrics)', 'Fellowship in Pulmonology'],
      experienceYears: 8,
      consultationFee: 650,
      bio: 'Specialized in pediatric respiratory conditions, childhood asthma, environmental allergies, and immunization regimens.',
    });

    // Doctor 12 (Dermatology)
    const docUser12 = await User.create({
      name: 'Dr. Sunita Rao, MD',
      email: 'dr.rao@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43212',
    });
    const doc12 = await Doctor.create({
      userId: docUser12._id,
      departmentId: deptMap['Dermatology'],
      specialization: 'Cosmetic Dermatology & Trichology',
      qualifications: ['MBBS', 'MD (DVL)', 'DNB'],
      experienceYears: 10,
      consultationFee: 750,
      bio: 'Expert in clinical cosmetology, advanced laser dermatology, pigmentation remedies, and hair disorders.',
    });

    // Patient 1
    const pUser1 = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      passwordHash: 'Patient@123',
      role: 'PATIENT',
      phone: '+91-98765-00301',
    });

    await Patient.create({
      userId: pUser1._id,
      dob: new Date('1990-05-15'),
      gender: 'MALE',
      bloodGroup: 'O+',
    });

    // Availability next 7 days
    const today = new Date();
    const allDoctors = [doc1, doc2, doc3, doc4, doc5, doc6, doc7, doc8, doc9, doc10, doc11, doc12];

    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + dayOffset);
      const dateStr = formatDateYYYYMMDD(targetDate);

      for (const doc of allDoctors) {
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

    // Seed Completed Appointment, Prescription & Paid Invoice for John Doe
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = formatDateYYYYMMDD(yesterday);

    const completedAppt = await Appointment.create({
      patientId: (await Patient.findOne({ userId: pUser1._id }))._id,
      doctorId: doc1._id,
      departmentId: deptMap['Cardiology'],
      date: yesterdayStr,
      startTime: '10:00',
      endTime: '10:30',
      status: 'COMPLETED',
      reason: 'Hypertension checkup and routine consultation',
      notes: 'Patient responded well to medications. Vitals stable.',
    });

    const seededPrescription = await Prescription.create({
      appointmentId: completedAppt._id,
      doctorId: doc1._id,
      patientId: completedAppt.patientId,
      diagnosis: 'Essential Hypertension',
      items: [
        {
          medicine: 'Amlodipine Besylate',
          dosage: '5mg',
          frequency: 'Once daily in the morning',
          duration: '30 days',
          instructions: 'Take with or without food',
        },
      ],
      generalAdvice: 'Low-sodium diet and regular morning BP tracking.',
    });

    const seededInvoice = await Invoice.create({
      invoiceNumber: 'INV-DEMO-001',
      appointmentId: completedAppt._id,
      patientId: completedAppt.patientId,
      doctorId: doc1._id,
      lineItems: [
        {
          description: 'Cardiology Consultation',
          amount: 150,
          quantity: 1,
        },
      ],
      subtotal: 150,
      discount: 0,
      tax: 0,
      total: 150,
      paymentStatus: 'PAID',
      paidAt: yesterday,
      paymentMethod: 'ONLINE_SIMULATION',
    });

    await Notification.create([
      {
        recipient: pUser1._id,
        type: 'PRESCRIPTION_AVAILABLE',
        message: 'Dr. Sarah Smith has uploaded your prescription.',
        relatedEntity: {
          entityType: 'Prescription',
          entityId: seededPrescription._id,
        },
        isRead: false,
      },
      {
        recipient: pUser1._id,
        type: 'BILLING_EVENT',
        message: 'Invoice INV-DEMO-001 for $150 was marked PAID.',
        relatedEntity: {
          entityType: 'Invoice',
          entityId: seededInvoice._id,
        },
        isRead: true,
      },
    ]);

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
