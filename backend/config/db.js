const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://gopikap2812_db_user:DWLr4pJB4wBwdvUo@gstdb.jggkrfo.mongodb.net/auditor_erp', {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Warning] MongoDB connection error: ${error.message}`);
    console.log('[Database Warning] Continuing server startup...');
  }
};

module.exports = connectDB;
