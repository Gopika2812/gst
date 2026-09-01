const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, default: Date.now },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    serviceType: { type: String, required: true },
    items: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true }
      }
    ],
    subTotal: { type: Number, required: true },
    gstPercent: { type: Number, default: 18 },
    gstAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Pending' },
    paymentMode: { type: String, enum: ['UPI', 'Bank Transfer', 'Cheque', 'Cash', 'Credit'], default: 'Bank Transfer' },
    remarks: { type: String },
    moveToTaskAssignment: { type: Boolean, default: false },
    taskCreated: { type: Boolean, default: false },
    assignedGroup: { type: String },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
