const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    certificateType: { type: String, required: true }, // GST, Udyam, FSSAI, Trade License, etc.
    department: { type: String, default: 'Registration' },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Waiting For Certificate', 'Certificate Received'], default: 'Waiting For Certificate' },
    applicationDate: { type: Date, default: Date.now },
    expectedDate: { type: Date },
    certificateNumber: { type: String },
    certificateReceived: { type: String, enum: ['Yes', 'No', 'Pending'], default: 'No' },
    receivedDate: { type: Date },
    uploadedCertificate: { type: String },
    remarks: { type: String },
    movedToBilling: { type: Boolean, default: false },
    noCertificateRequired: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certification', certificationSchema);
