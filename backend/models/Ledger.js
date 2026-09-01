const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    date: { type: Date, default: Date.now },
    transactionType: {
      type: String,
      enum: ['Opening Balance', 'Invoice', 'Payment Received', 'Credit Note', 'Debit Note'],
      required: true
    },
    referenceNumber: { type: String },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    runningBalance: { type: Number, required: true },
    description: { type: String },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    paymentMode: { type: String, default: 'Bank Transfer' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ledger', ledgerSchema);
