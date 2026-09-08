const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { PORT } = require('./src/config/env');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(` MediFlow Backend Server Running`);
      console.log(` Port: ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` API Base: http://localhost:${PORT}/api/v1`);
      console.log(`=========================================`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
