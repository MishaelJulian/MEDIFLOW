const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const departmentRoutes = require('./department.routes');
const doctorRoutes = require('./doctor.routes');
const appointmentRoutes = require('./appointment.routes');

// Healthcheck endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MediFlow API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Member 1 Owned Domain Routes
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/departments', departmentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);

module.exports = router;
