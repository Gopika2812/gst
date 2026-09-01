const Ledger = require('../models/Ledger');
const Client = require('../models/Client');
const { logAudit } = require('../middleware/auditLogger');

// Helper to recalculate running balances for all entries of a client
const recalculateClientLedger = async (clientId) => {
  const client = await Client.findById(clientId);
  if (!client) return 0;

  const entries = await Ledger.find({ client: clientId }).sort({ date: 1, createdAt: 1 });
  let running = client.openingBalance || 0;

  for (const entry of entries) {
    if (['Debit Note', 'Invoice'].includes(entry.transactionType)) {
      running += (entry.debit || 0);
    } else if (['Payment Received', 'Credit Note'].includes(entry.transactionType)) {
      running -= (entry.credit || 0);
    }
    entry.runningBalance = running;
    await entry.save();
  }

  client.closingBalance = running;
  await client.save();
  return running;
};

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
    const closingBalance = (client.openingBalance || 0) + totalDebit - totalCredit;

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
    const { client: clientId, transactionType, referenceNumber, amount, description, date } = req.body;

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // 1. Duplicate Prevention: Check if identical transaction was created in the last 15 seconds (prevents rapid double-clicks)
    const fifteenSecsAgo = new Date(Date.now() - 15 * 1000);
    const recentDuplicate = await Ledger.findOne({
      client: clientId,
      transactionType,
      credit: ['Payment Received', 'Credit Note'].includes(transactionType) ? numAmount : 0,
      debit: ['Debit Note', 'Invoice'].includes(transactionType) ? numAmount : 0,
      createdAt: { $gte: fifteenSecsAgo }
    });

    if (recentDuplicate) {
      return res.status(400).json({
        message: 'Duplicate submission detected. Please wait a moment before submitting again.'
      });
    }

    // 2. Duplicate Reference Number check: Check if same reference number exists for this client today
    if (referenceNumber && referenceNumber.trim() && referenceNumber.trim().toLowerCase() !== 'upi' && referenceNumber.trim().toLowerCase() !== 'cash') {
      const existingRef = await Ledger.findOne({
        client: clientId,
        referenceNumber: referenceNumber.trim(),
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      if (existingRef) {
        return res.status(400).json({
          message: `Duplicate Reference Error: Transaction with reference "${referenceNumber}" was already recorded for this client.`
        });
      }
    }

    let debit = 0;
    let credit = 0;

    if (['Debit Note', 'Invoice'].includes(transactionType)) {
      debit = numAmount;
    } else if (['Payment Received', 'Credit Note'].includes(transactionType)) {
      credit = numAmount;
    }

    const entry = await Ledger.create({
      client: clientId,
      date: date ? new Date(date) : new Date(),
      transactionType,
      referenceNumber: referenceNumber ? referenceNumber.trim() : '',
      debit,
      credit,
      runningBalance: 0, // Calculated accurately below
      description: description || ''
    });

    const newClosingBalance = await recalculateClientLedger(clientId);

    await logAudit(req.user, 'Ledger Transaction', 'Client Ledger', `Recorded ${transactionType} ₹${amount} for client ${client.clientName}`, req);

    res.status(201).json({ message: 'Ledger transaction saved', entry, closingBalance: newClosingBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing Ledger Transaction (Edit Receipt/Entry)
exports.updateLedgerTransaction = async (req, res) => {
  try {
    const { transactionType, referenceNumber, amount, description, date } = req.body;
    const entry = await Ledger.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Transaction record not found' });
    }

    const numAmount = Number(amount) !== undefined && !isNaN(Number(amount)) ? Number(amount) : (entry.debit || entry.credit);

    if (transactionType) entry.transactionType = transactionType;
    if (referenceNumber !== undefined) entry.referenceNumber = referenceNumber.trim();
    if (description !== undefined) entry.description = description;
    if (date) entry.date = new Date(date);

    if (['Debit Note', 'Invoice'].includes(entry.transactionType)) {
      entry.debit = numAmount;
      entry.credit = 0;
    } else if (['Payment Received', 'Credit Note'].includes(entry.transactionType)) {
      entry.credit = numAmount;
      entry.debit = 0;
    }

    await entry.save();

    const newClosingBalance = await recalculateClientLedger(entry.client);

    await logAudit(req.user, 'Ledger Updated', 'Client Ledger', `Updated transaction ${entry._id} for amount ₹${numAmount}`, req);

    res.json({ message: 'Transaction updated successfully', entry, closingBalance: newClosingBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Ledger Transaction (Remove Mistaken / Duplicate Entry)
exports.deleteLedgerTransaction = async (req, res) => {
  try {
    const entry = await Ledger.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Transaction record not found' });
    }

    const clientId = entry.client;
    await entry.deleteOne();

    const newClosingBalance = await recalculateClientLedger(clientId);

    await logAudit(req.user, 'Ledger Entry Deleted', 'Client Ledger', `Deleted transaction ID: ${req.params.id}`, req);

    res.json({ message: 'Transaction removed successfully', closingBalance: newClosingBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
