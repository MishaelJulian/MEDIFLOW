const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const DoctorAvailability = require('../models/DoctorAvailability');
const Appointment = require('../models/Appointment');
const { connectDB, disconnectDB } = require('../config/db');
const { formatDateYYYYMMDD } = require('../utils/timeUtils');

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Department.deleteMany({});
    await Doctor.deleteMany({});
    await DoctorAvailability.deleteMany({});
    await Appointment.deleteMany({});

    console.log('[Seed] Creating Departments...');
    const departments = await Department.create([
      {
        name: 'Cardiology',
        description: 'Comprehensive care for cardiovascular diseases and heart conditions.',
      },
      {
        name: 'Neurology',
        description: 'Diagnosis and management of disorders of the brain and nervous system.',
      },
      {
        name: 'Orthopedics',
        description: 'Specialized surgical and non-surgical care for musculoskeletal issues.',
      },
      {
        name: 'General Medicine',
        description: 'Primary healthcare, routine examinations, and acute illness treatment.',
      },
      {
        name: 'Pediatrics',
        description: 'Specialized medical care for infants, children, and adolescents.',
      },
      {
        name: 'Dermatology',
        description: 'Skin health, dermatological surgery, and cosmetic consultations.',
      },
    ]);

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.name] = d._id;
    });

    console.log('[Seed] Creating Administrator...');
    await User.create({
      name: 'System Administrator',
      email: 'admin@mediflow.com',
      passwordHash: 'Admin@123',
      role: 'ADMIN',
      phone: '+1-555-0100',
      isActive: true,
    });

    console.log('[Seed] Creating Receptionist...');
    await User.create({
      name: 'Central Receptionist',
      email: 'receptionist@mediflow.com',
      passwordHash: 'Recep@123',
      role: 'RECEPTIONIST',
      phone: '+1-555-0101',
      isActive: true,
    });

    console.log('[Seed] Creating Doctors...');
    // Doctor 1: Dr. Sarah Smith (Cardiology)
    const docUser1 = await User.create({
      name: 'Dr. Sarah Smith, MD',
      email: 'dr.smith@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+1-555-0201',
      isActive: true,
    });

    const doctor1 = await Doctor.create({
      userId: docUser1._id,
      departmentId: deptMap['Cardiology'],
      specialization: 'Interventional Cardiology',
      qualifications: ['MBBS', 'MD (Cardiology)', 'FACC'],
      experienceYears: 12,
      consultationFee: 150,
      bio: 'Senior cardiologist with over a decade of clinical experience in coronary interventions and heart failure.',
      isActive: true,
    });

    // Doctor 2: Dr. David Jones (Neurology)
    const docUser2 = await User.create({
      name: 'Dr. David Jones, MD',
      email: 'dr.jones@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+1-555-0202',
      isActive: true,
    });

    const doctor2 = await Doctor.create({
      userId: docUser2._id,
      departmentId: deptMap['Neurology'],
      specialization: 'Clinical Neurophysiology',
      qualifications: ['MBBS', 'MD (Neurology)', 'DM'],
      experienceYears: 9,
      consultationFee: 140,
      bio: 'Expert neurologist specializing in headache management, stroke rehabilitation, and epilepsy.',
      isActive: true,
    });

    // Doctor 3: Dr. Anita Patel (Orthopedics)
    const docUser3 = await User.create({
      name: 'Dr. Anita Patel, MS',
      email: 'dr.patel@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+1-555-0203',
      isActive: true,
    });

    const doctor3 = await Doctor.create({
      userId: docUser3._id,
      departmentId: deptMap['Orthopedics'],
      specialization: 'Joint Replacement & Sports Medicine',
      qualifications: ['MBBS', 'MS (Orthopedics)'],
      experienceYears: 8,
      consultationFee: 120,
      bio: 'Orthopedic specialist in robotic knee replacement and minimally invasive arthroscopic surgeries.',
      isActive: true,
    });

    console.log('[Seed] Creating Patients...');
    // Patient 1: John Doe
    const patientUser1 = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      passwordHash: 'Patient@123',
      role: 'PATIENT',
      phone: '+1-555-0301',
      isActive: true,
    });

    const patient1 = await Patient.create({
      userId: patientUser1._id,
      dob: new Date('1990-05-15'),
      gender: 'MALE',
      bloodGroup: 'O+',
      address: {
        street: '123 Elm Street',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001',
      },
      medicalNotes: 'Mild seasonal allergies. No history of chronic illness.',
    });

    // Patient 2: Jane Smith
    const patientUser2 = await User.create({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      passwordHash: 'Patient@123',
      role: 'PATIENT',
      phone: '+1-555-0302',
      isActive: true,
    });

    const patient2 = await Patient.create({
      userId: patientUser2._id,
      dob: new Date('1985-08-22'),
      gender: 'FEMALE',
      bloodGroup: 'A+',
      address: {
        street: '456 Oak Avenue',
        city: 'Gotham',
        state: 'NJ',
        zipCode: '07001',
      },
      medicalNotes: 'History of asthma; manages with inhaler.',
    });

    console.log('[Seed] Creating Doctor Availability Slots (Next 7 Days)...');
    const today = new Date();
    const doctorsList = [doctor1, doctor2, doctor3];

    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + dayOffset);
      const dateStr = formatDateYYYYMMDD(targetDate);

      for (const doc of doctorsList) {
        // Morning shift
        await DoctorAvailability.create({
          doctorId: doc._id,
          date: dateStr,
          startTime: '09:00',
          endTime: '12:00',
          slotDuration: 30,
          isActive: true,
        });

        // Afternoon shift
        await DoctorAvailability.create({
          doctorId: doc._id,
          date: dateStr,
          startTime: '14:00',
          endTime: '17:00',
          slotDuration: 30,
          isActive: true,
        });
      }
    }

    console.log('====================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Demo Accounts:');
    console.log('1. Admin:        admin@mediflow.com       / Admin@123');
    console.log('2. Receptionist: receptionist@mediflow.com / Recep@123');
    console.log('3. Doctor (Card):dr.smith@mediflow.com    / Doctor@123');
    console.log('4. Doctor (Neur):dr.jones@mediflow.com    / Doctor@123');
    console.log('5. Doctor (Ortho):dr.patel@mediflow.com   / Doctor@123');
    console.log('6. Patient 1:    john.doe@example.com     / Patient@123');
    console.log('7. Patient 2:    jane.smith@example.com   / Patient@123');
    console.log('====================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed: ${error.message}`);
    console.error(error);
    await disconnectDB();
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
