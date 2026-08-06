const mongoose = require('mongoose');

const filingRecordSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    department: {
      type: String,
      enum: ['GST', 'Book Keeping', 'IT Filing', 'Registration'],
      required: true
    },
    filingPeriod: { type: String, required: true },
    acknowledgementNumber: { type: String },
    filingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Filed', 'Pending Document', 'Rejected'], default: 'Filed' },
    filedDocumentUrl: { type: String },
    remarks: { type: String },
    filedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FilingRecord', filingRecordSchema);
