const Ledger = require('../models/Ledger');
const Client = require('../models/Client');
const { logAudit } = require('../middleware/auditLogger');

// Get Ledger Statement for a Client
exports.getClientLedger = async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const ledgerEntries = await Ledger.find({ client: clientId }).sort({ date: 1, createdAt: 1 });

    const totalDebit = ledgerEntries.reduce((acc, curr) => acc + (curr.debit || 0), 0);
    const totalCredit = ledgerEntries.reduce((acc, curr) => acc + (curr.credit || 0), 0);
    const closingBalance = totalDebit - totalCredit;

    res.json({
      client,
      openingBalance: client.openingBalance || 0,
      totalDebit,
      totalCredit,
      closingBalance,
      entries: ledgerEntries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record Manual Payment / Credit Note / Debit Note
exports.addLedgerTransaction = async (req, res) => {
  try {
    const { client: clientId, transactionType, referenceNumber, amount, description } = req.body;

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const lastLedger = await Ledger.findOne({ client: clientId }).sort({ createdAt: -1 });
    const currentBalance = lastLedger ? lastLedger.runningBalance : client.closingBalance || 0;

    let debit = 0;
    let credit = 0;
    let newBalance = currentBalance;

    if (['Debit Note', 'Invoice'].includes(transactionType)) {
      debit = Number(amount);
      newBalance += debit;
    } else if (['Payment Received', 'Credit Note'].includes(transactionType)) {
      credit = Number(amount);
      newBalance -= credit;
    }

    const entry = await Ledger.create({
      client: clientId,
      date: new Date(),
      transactionType,
      referenceNumber,
      debit,
      credit,
      runningBalance: newBalance,
      description
    });

    client.closingBalance = newBalance;
    await client.save();

    await logAudit(req.user, 'Ledger Transaction', 'Client Ledger', `Recorded ${transactionType} ₹${amount} for client ${client.clientName}`, req);

    res.status(201).json({ message: 'Ledger transaction saved', entry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
