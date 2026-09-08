const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const connectDB = async (uri = MONGODB_URI) => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected');
  } catch (error) {
    console.error(`[Database Error] Disconnect error: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
