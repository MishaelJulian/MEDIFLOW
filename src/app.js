const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./errors/AppError');

const app = express();

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// Static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Version 1 Routes
app.use('/api/v1', apiRoutes);
// Compatibility alias for /api
app.use('/api', apiRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to MediFlow Hospital Patient & Appointment Management System API',
    docs: '/api/v1/health',
  });
});

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Handle 404 Unmatched Routes
app.all('*', (req, res, next) => {
  next(AppError.notFound(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
