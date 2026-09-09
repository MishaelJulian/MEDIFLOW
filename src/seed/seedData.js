const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const DoctorAvailability = require('../models/DoctorAvailability');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');
const Invoice = require('../models/Invoice');
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
    await Prescription.deleteMany({});
    await Notification.deleteMany({});
    await Invoice.deleteMany({});

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
      phone: '+91-98765-43201',
      isActive: true,
    });
    const doctor1 = await Doctor.create({
      userId: docUser1._id,
      departmentId: deptMap['Cardiology'],
      specialization: 'Interventional Cardiology',
      qualifications: ['MBBS', 'MD (Cardiology)', 'FACC'],
      experienceYears: 12,
      consultationFee: 800,
      bio: 'Senior cardiologist with over a decade of clinical experience in coronary interventions and heart failure.',
      isActive: true,
    });

    // Doctor 2: Dr. David Jones (Neurology)
    const docUser2 = await User.create({
      name: 'Dr. David Jones, MD',
      email: 'dr.jones@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43202',
      isActive: true,
    });
    const doctor2 = await Doctor.create({
      userId: docUser2._id,
      departmentId: deptMap['Neurology'],
      specialization: 'Clinical Neurophysiology',
      qualifications: ['MBBS', 'MD (Neurology)', 'DM'],
      experienceYears: 9,
      consultationFee: 900,
      bio: 'Expert neurologist specializing in headache management, stroke rehabilitation, and epilepsy.',
      isActive: true,
    });

    // Doctor 3: Dr. Anita Patel (Orthopedics)
    const docUser3 = await User.create({
      name: 'Dr. Anita Patel, MS',
      email: 'dr.patel@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43203',
      isActive: true,
    });
    const doctor3 = await Doctor.create({
      userId: docUser3._id,
      departmentId: deptMap['Orthopedics'],
      specialization: 'Joint Replacement & Sports Medicine',
      qualifications: ['MBBS', 'MS (Orthopedics)'],
      experienceYears: 8,
      consultationFee: 750,
      bio: 'Orthopedic specialist in robotic knee replacement and minimally invasive arthroscopic surgeries.',
      isActive: true,
    });

    // Doctor 4: Dr. Rajesh Sharma (General Medicine)
    const docUser4 = await User.create({
      name: 'Dr. Rajesh Sharma, MD',
      email: 'dr.sharma@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43204',
      isActive: true,
    });
    const doctor4 = await Doctor.create({
      userId: docUser4._id,
      departmentId: deptMap['General Medicine'],
      specialization: 'Internal Medicine & Diabetology',
      qualifications: ['MBBS', 'MD (General Medicine)'],
      experienceYears: 15,
      consultationFee: 500,
      bio: 'Consultant physician with extensive expertise in preventive healthcare, hypertension, and diabetes management.',
      isActive: true,
    });

    // Doctor 5: Dr. Priya Nair (Pediatrics)
    const docUser5 = await User.create({
      name: 'Dr. Priya Nair, MD',
      email: 'dr.nair@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43205',
      isActive: true,
    });
    const doctor5 = await Doctor.create({
      userId: docUser5._id,
      departmentId: deptMap['Pediatrics'],
      specialization: 'Child Healthcare & Neonatology',
      qualifications: ['MBBS', 'DCH', 'MD (Pediatrics)'],
      experienceYears: 10,
      consultationFee: 600,
      bio: 'Compassionate pediatrician focusing on developmental milestones, vaccinations, and pediatric emergency care.',
      isActive: true,
    });

    // Doctor 6: Dr. Vikram Malhotra (Dermatology)
    const docUser6 = await User.create({
      name: 'Dr. Vikram Malhotra, MD',
      email: 'dr.malhotra@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43206',
      isActive: true,
    });
    const doctor6 = await Doctor.create({
      userId: docUser6._id,
      departmentId: deptMap['Dermatology'],
      specialization: 'Clinical & Aesthetic Dermatology',
      qualifications: ['MBBS', 'MD (Dermatology)'],
      experienceYears: 11,
      consultationFee: 700,
      bio: 'Specialist in clinical dermatology, laser skin therapies, acne treatments, and hair restoration.',
      isActive: true,
    });

    // Doctor 7: Dr. Ananya Sen (Cardiology)
    const docUser7 = await User.create({
      name: 'Dr. Ananya Sen, DM',
      email: 'dr.sen@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43207',
      isActive: true,
    });
    const doctor7 = await Doctor.create({
      userId: docUser7._id,
      departmentId: deptMap['Cardiology'],
      specialization: 'Cardiac Electrophysiology & Arrhythmia',
      qualifications: ['MBBS', 'MD', 'DM (Cardiology)'],
      experienceYears: 7,
      consultationFee: 850,
      bio: 'Cardiology specialist focusing on cardiac pacing, electrophysiology studies, and arrhythmia ablation.',
      isActive: true,
    });

    // Doctor 8: Dr. Rohan Mehta (Orthopedics)
    const docUser8 = await User.create({
      name: 'Dr. Rohan Mehta, MCh',
      email: 'dr.mehta@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43208',
      isActive: true,
    });
    const doctor8 = await Doctor.create({
      userId: docUser8._id,
      departmentId: deptMap['Orthopedics'],
      specialization: 'Spine Surgery & Trauma',
      qualifications: ['MBBS', 'MS (Ortho)', 'MCh (Orthopedics)'],
      experienceYears: 14,
      consultationFee: 800,
      bio: 'Renowned spine surgeon specializing in endoscopic spine surgery, disc replacements, and complex trauma care.',
      isActive: true,
    });

    // Doctor 9: Dr. Suresh Iyer (Neurology)
    const docUser9 = await User.create({
      name: 'Dr. Suresh Iyer, DM',
      email: 'dr.iyer@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43209',
      isActive: true,
    });
    const doctor9 = await Doctor.create({
      userId: docUser9._id,
      departmentId: deptMap['Neurology'],
      specialization: 'Cognitive Neurology & Dementia',
      qualifications: ['MBBS', 'MD', 'DM (Neurology)'],
      experienceYears: 13,
      consultationFee: 950,
      bio: 'Specialist in memory disorders, cognitive rehabilitation, and neuro-degenerative illness management.',
      isActive: true,
    });

    // Doctor 10: Dr. Neha Gupta (General Medicine)
    const docUser10 = await User.create({
      name: 'Dr. Neha Gupta, MD',
      email: 'dr.gupta@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43210',
      isActive: true,
    });
    const doctor10 = await Doctor.create({
      userId: docUser10._id,
      departmentId: deptMap['General Medicine'],
      specialization: 'Geriatric & Infectious Diseases',
      qualifications: ['MBBS', 'MD (Internal Medicine)'],
      experienceYears: 9,
      consultationFee: 550,
      bio: 'Dedicated internist with deep expertise in geriatric healthcare, chronic lifestyle illnesses, and seasonal infections.',
      isActive: true,
    });

    // Doctor 11: Dr. Arjun Kapoor (Pediatrics)
    const docUser11 = await User.create({
      name: 'Dr. Arjun Kapoor, MD',
      email: 'dr.kapoor@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43211',
      isActive: true,
    });
    const doctor11 = await Doctor.create({
      userId: docUser11._id,
      departmentId: deptMap['Pediatrics'],
      specialization: 'Pediatric Pulmonology & Allergy',
      qualifications: ['MBBS', 'MD (Pediatrics)', 'Fellowship in Pulmonology'],
      experienceYears: 8,
      consultationFee: 650,
      bio: 'Specialized in pediatric respiratory conditions, childhood asthma, environmental allergies, and immunization regimens.',
      isActive: true,
    });

    // Doctor 12: Dr. Sunita Rao (Dermatology)
    const docUser12 = await User.create({
      name: 'Dr. Sunita Rao, MD',
      email: 'dr.rao@mediflow.com',
      passwordHash: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91-98765-43212',
      isActive: true,
    });
    const doctor12 = await Doctor.create({
      userId: docUser12._id,
      departmentId: deptMap['Dermatology'],
      specialization: 'Cosmetic Dermatology & Trichology',
      qualifications: ['MBBS', 'MD (DVL)', 'DNB'],
      experienceYears: 10,
      consultationFee: 750,
      bio: 'Expert in clinical cosmetology, advanced laser dermatology, pigmentation remedies, and hair disorders.',
      isActive: true,
    });

    console.log('[Seed] Creating Patients...');
    // Patient 1: John Doe
    const patientUser1 = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      passwordHash: 'Patient@123',
      role: 'PATIENT',
      phone: '+91-98765-00301',
      isActive: true,
    });

    const patient1 = await Patient.create({
      userId: patientUser1._id,
      dob: new Date('1990-05-15'),
      gender: 'MALE',
      bloodGroup: 'O+',
      address: {
        street: '123 MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
      },
      medicalNotes: 'Mild seasonal allergies. No history of chronic illness.',
    });

    // Patient 2: Jane Smith
    const patientUser2 = await User.create({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      passwordHash: 'Patient@123',
      role: 'PATIENT',
      phone: '+91-98765-00302',
      isActive: true,
    });

    const patient2 = await Patient.create({
      userId: patientUser2._id,
      dob: new Date('1985-08-22'),
      gender: 'FEMALE',
      bloodGroup: 'A+',
      address: {
        street: '456 Brigade Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
      },
      medicalNotes: 'History of asthma; manages with inhaler.',
    });

    console.log('[Seed] Creating Doctor Availability Slots (Next 7 Days)...');
    const today = new Date();
    const doctorsList = [
      doctor1,
      doctor2,
      doctor3,
      doctor4,
      doctor5,
      doctor6,
      doctor7,
      doctor8,
      doctor9,
      doctor10,
      doctor11,
      doctor12,
    ];

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

    console.log('[Seed] Creating Sample Completed Appointment, Prescription & Invoice...');
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = formatDateYYYYMMDD(yesterday);

    // Completed appointment for Patient 1 with Doctor 1
    const completedAppt = await Appointment.create({
      patientId: patient1._id,
      doctorId: doctor1._id,
      departmentId: deptMap['Cardiology'],
      date: yesterdayStr,
      startTime: '10:00',
      endTime: '10:30',
      status: 'COMPLETED',
      reason: 'Routine hypertension follow-up and chest tightness evaluation',
      notes: 'Blood pressure stable at 128/82. Advised to continue lifestyle modifications.',
      slotKey: null,
    });

    // Seed Prescription for completed appointment
    const seededPrescription = await Prescription.create({
      appointmentId: completedAppt._id,
      doctorId: doctor1._id,
      patientId: patient1._id,
      diagnosis: 'Essential Hypertension (Well Controlled)',
      items: [
        {
          medicine: 'Amlodipine Besylate',
          dosage: '5mg',
          frequency: 'Once daily in the morning',
          duration: '30 days',
          instructions: 'Take with or without food. Monitor morning BP.',
        },
        {
          medicine: 'Atorvastatin',
          dosage: '20mg',
          frequency: 'Once daily at bedtime',
          duration: '30 days',
          instructions: 'Cardioprotective lipid management.',
        },
      ],
      generalAdvice: 'Reduce daily sodium intake to under 2g. Moderate aerobic exercise 30 min/day.',
      followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    });

    // Seed Invoice for completed appointment
    const seededInvoice = await Invoice.create({
      invoiceNumber: 'INV-DEMO-001',
      appointmentId: completedAppt._id,
      patientId: patient1._id,
      doctorId: doctor1._id,
      lineItems: [
        {
          description: 'Specialist Consultation Fee (Interventional Cardiology)',
          amount: 800,
          quantity: 1,
        },
        {
          description: '12-Lead Electrocardiogram (ECG) Diagnostic',
          amount: 500,
          quantity: 1,
        },
      ],
      subtotal: 1300,
      discount: 100,
      tax: 0,
      total: 1200,
      paymentStatus: 'PAID',
      paidAt: yesterday,
      paymentMethod: 'ONLINE_SIMULATION',
      notes: 'Paid at front desk via UPI online settlement simulation.',
    });

    // Upcoming Booked appointment for Patient 2 with Doctor 2
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = formatDateYYYYMMDD(tomorrow);

    const bookedAppt = await Appointment.create({
      patientId: patient2._id,
      doctorId: doctor2._id,
      departmentId: deptMap['Neurology'],
      date: tomorrowStr,
      startTime: '11:00',
      endTime: '11:30',
      status: 'BOOKED',
      reason: 'Frequent migraines and light sensitivity',
      slotKey: `${doctor2._id}_${tomorrowStr}_11:00`,
    });

    // Seed Pending Invoice for upcoming appointment
    await Invoice.create({
      invoiceNumber: 'INV-DEMO-002',
      appointmentId: bookedAppt._id,
      patientId: patient2._id,
      doctorId: doctor2._id,
      lineItems: [
        {
          description: 'Specialist Consultation Fee (Clinical Neurophysiology)',
          amount: 900,
          quantity: 1,
        },
      ],
      subtotal: 900,
      discount: 0,
      tax: 0,
      total: 900,
      paymentStatus: 'PENDING',
      notes: 'Scheduled for payment upon appointment check-in.',
    });

    console.log('[Seed] Creating Seed Notifications...');
    await Notification.create([
      {
        recipient: patientUser1._id,
        type: 'PRESCRIPTION_AVAILABLE',
        message: 'Dr. Sarah Smith has issued your prescription for consultation on ' + yesterdayStr + '.',
        relatedEntity: {
          entityType: 'Prescription',
          entityId: seededPrescription._id,
        },
        isRead: false,
      },
      {
        recipient: patientUser1._id,
        type: 'BILLING_EVENT',
        message: 'Invoice INV-DEMO-001 for ₹1200 has been marked as PAID.',
        relatedEntity: {
          entityType: 'Invoice',
          entityId: seededInvoice._id,
        },
        isRead: true,
      },
      {
        recipient: patientUser2._id,
        type: 'APPOINTMENT_CREATED',
        message: 'Your appointment with Dr. David Jones on ' + tomorrowStr + ' at 11:00 is scheduled.',
        relatedEntity: {
          entityType: 'Appointment',
          entityId: bookedAppt._id,
        },
        isRead: false,
      },
      {
        recipient: docUser2._id,
        type: 'APPOINTMENT_CREATED',
        message: 'Jane Smith booked a consultation for ' + tomorrowStr + ' at 11:00.',
        relatedEntity: {
          entityType: 'Appointment',
          entityId: bookedAppt._id,
        },
        isRead: false,
      },
    ]);

    console.log('====================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Demo Accounts:');
    console.log('1. Admin:        admin@mediflow.com       / Admin@123');
    console.log('2. Receptionist: receptionist@mediflow.com / Recep@123');
    console.log('3. Doctor (Card):dr.smith@mediflow.com    / Doctor@123');
    console.log('4. Doctor (Neur):dr.jones@mediflow.com    / Doctor@123');
    console.log('5. Doctor (Ortho):dr.patel@mediflow.com   / Doctor@123');
    console.log('6. Doctor (Gen): dr.sharma@mediflow.com   / Doctor@123');
    console.log('7. Doctor (Pedia):dr.nair@mediflow.com    / Doctor@123');
    console.log('8. Doctor (Derm):dr.malhotra@mediflow.com / Doctor@123');
    console.log('9. Patient 1:    john.doe@example.com     / Patient@123');
    console.log('10. Patient 2:   jane.smith@example.com   / Patient@123');
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
