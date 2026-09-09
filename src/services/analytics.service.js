const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Invoice = require('../models/Invoice');
const AppError = require('../errors/AppError');

class AnalyticsService {
  /**
   * Deterministic Operational No-Show Risk Prediction
   * Evaluates scheduling lead time, patient attendance history, and time variables.
   * Safety notice: For administrative scheduling optimization only, not clinical advice.
   */
  async predictAppointmentNoShowRisk(appointmentId) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId')
      .populate('doctorId');

    if (!appointment) {
      throw AppError.notFound('Appointment not found');
    }

    const patientId = appointment.patientId?._id;

    // 1. Calculate lead time in days
    const createdDate = appointment.createdAt ? new Date(appointment.createdAt) : new Date();
    const apptDate = new Date(`${appointment.date}T${appointment.startTime || '09:00'}:00`);
    const diffMs = apptDate.getTime() - createdDate.getTime();
    const leadTimeDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

    // 2. Query historical attendance for this patient
    let historicalNoShows = 0;
    let historicalCancellations = 0;
    let historicalCompleted = 0;

    if (patientId) {
      const pastAppointments = await Appointment.find({
        patientId,
        _id: { $ne: appointment._id },
      }).select('status');

      historicalNoShows = pastAppointments.filter((a) => a.status === 'NO_SHOW').length;
      historicalCancellations = pastAppointments.filter((a) => a.status === 'CANCELLED').length;
      historicalCompleted = pastAppointments.filter((a) => a.status === 'COMPLETED').length;
    }

    // 3. Evaluate Day of Week & Hour
    const dayOfWeek = apptDate.getDay(); // 0=Sun, 1=Mon, 5=Fri, 6=Sat
    const [hour] = (appointment.startTime || '09:00').split(':').map(Number);

    // 4. Compute Weighted Score (0 - 100)
    let score = 20; // baseline low risk
    const factors = [];

    // Lead time factor
    if (leadTimeDays > 14) {
      score += 25;
      factors.push(`Long lead time (${leadTimeDays} days in advance increases forgetfulness probability)`);
    } else if (leadTimeDays > 7) {
      score += 15;
      factors.push(`Moderate lead time (${leadTimeDays} days in advance)`);
    } else if (leadTimeDays <= 1) {
      score -= 10;
      factors.push(`Short notice booking (${leadTimeDays} day notice improves attendance probability)`);
    }

    // Historical attendance factors
    if (historicalNoShows > 0) {
      const penalty = Math.min(40, historicalNoShows * 20);
      score += penalty;
      factors.push(`Patient has ${historicalNoShows} recorded previous no-show(s) (+${penalty} risk)`);
    }

    if (historicalCancellations > 0) {
      const penalty = Math.min(20, historicalCancellations * 10);
      score += penalty;
      factors.push(`Patient has ${historicalCancellations} recorded cancellation(s) (+${penalty} risk)`);
    }

    if (historicalCompleted >= 3) {
      score -= 15;
      factors.push(`Patient has strong completed visit history (${historicalCompleted} visits)`);
    }

    // Day of week / time factors
    if (dayOfWeek === 1 || dayOfWeek === 5) {
      score += 10;
      factors.push(`Weekend boundary slot (${dayOfWeek === 1 ? 'Monday' : 'Friday'} appointments experience higher cancellation rates)`);
    }

    if (hour >= 16 || hour < 9) {
      score += 10;
      factors.push(`Off-peak hour slot (${appointment.startTime} slot carries higher schedule drift)`);
    }

    // Clamp score
    const riskScore = Math.min(100, Math.max(5, score));

    let riskLevel = 'LOW';
    if (riskScore >= 70) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 40) {
      riskLevel = 'MEDIUM';
    }

    return {
      appointmentId: appointment._id,
      patientName: appointment.patientId?.userId?.name || 'Patient',
      doctorName: appointment.doctorId?.userId?.name || 'Doctor',
      date: appointment.date,
      startTime: appointment.startTime,
      riskLevel,
      riskScore,
      factors: factors.length > 0 ? factors : ['Standard schedule within normal operational parameters'],
      leadTimeDays,
      historicalStats: {
        completed: historicalCompleted,
        cancelled: historicalCancellations,
        noShows: historicalNoShows,
      },
      disclaimer: 'Operational analytics only. This feature is intended for staff scheduling optimization and does not constitute medical diagnosis or clinical decision support.',
    };
  }

  /**
   * Hospital Operational Analytics & Dashboard Summary
   */
  async getHospitalDashboardSummary() {
    const [
      totalPatients,
      totalDoctors,
      totalDepartments,
      appointments,
      invoices,
    ] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true }),
      Department.countDocuments({ isActive: true }),
      Appointment.find().select('status date startTime departmentId').lean(),
      Invoice.find().select('total paymentStatus').lean(),
    ]);

    // Status breakdown
    const statusCounts = {
      BOOKED: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      NO_SHOW: 0,
    };

    appointments.forEach((appt) => {
      if (statusCounts[appt.status] !== undefined) {
        statusCounts[appt.status]++;
      }
    });

    // Revenue calculation
    let totalRevenue = 0;
    let pendingRevenue = 0;
    invoices.forEach((inv) => {
      if (inv.paymentStatus === 'PAID') {
        totalRevenue += inv.total || 0;
      } else if (inv.paymentStatus === 'PENDING') {
        pendingRevenue += inv.total || 0;
      }
    });

    // Today's appointments count
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayAppointments = appointments.filter((a) => a.date === todayStr).length;

    return {
      summary: {
        totalPatients,
        totalDoctors,
        totalDepartments,
        totalAppointments: appointments.length,
        todayAppointments,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingRevenue: Math.round(pendingRevenue * 100) / 100,
      },
      appointmentStatusDistribution: statusCounts,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new AnalyticsService();
