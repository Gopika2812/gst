const mongoose = require('mongoose');

const serviceMasterSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      enum: ['GST Filing', 'Income Tax', 'Accounts', 'GST', 'Income Tax Filing', 'Book Keeping'],
      default: 'GST Filing'
    },
    serviceName: { type: String, required: true, trim: true },
    subServiceName: { type: String, required: true, trim: true },
    startDayOfMonth: { type: Number, default: 1, min: 1, max: 31 },
    dueDayOfMonth: { type: Number, default: 11, min: 1, max: 31 },
    periodicity: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Yearly', 'One-time'],
      default: 'Monthly'
    },
    description: { type: String, trim: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceMaster', serviceMasterSchema);
