const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Ledger = require('../models/Ledger');
const Task = require('../models/Task');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { logAudit } = require('../middleware/auditLogger');

// Generate Invoice Number e.g. INV00126 (INV + 3-digit counter + 2-digit year)
const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const yearSuffix = String(new Date().getFullYear()).slice(-2);
  const counterStr = String(count + 1).padStart(3, '0');
  return `INV${counterStr}${yearSuffix}`;
};

// Create Invoice
exports.createInvoice = async (req, res) => {
  try {
    const {
      client,
      serviceType,
      items,
      subTotal,
      gstPercent,
      gstAmount,
      discount,
      total,
      paidAmount,
      paymentMode,
      remarks,
      moveToTaskAssignment,
      assignedGroup,
      assignedEmployee,
      taskDueDate,
      taskPriority
    } = req.body;

    const clientDoc = await Client.findById(client);
    if (!clientDoc) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const invoiceNumber = await generateInvoiceNumber();
    const paid = Number(paidAmount) || 0;
    const pending = total - paid;
    let paymentStatus = 'Pending';
    if (paid >= total) paymentStatus = 'Paid';
    else if (paid > 0) paymentStatus = 'Partial';

    const invoice = await Invoice.create({
      invoiceNumber,
      client,
      serviceType,
      items: items || [{ description: serviceType, amount: subTotal }],
      subTotal,
      gstPercent: gstPercent || 18,
      gstAmount: gstAmount || 0,
      discount: discount || 0,
      total,
      paidAmount: paid,
      pendingAmount: pending,
      paymentStatus,
      paymentMode: paymentMode || 'Bank Transfer',
      remarks,
      moveToTaskAssignment: !!moveToTaskAssignment,
      createdBy: req.user._id
    });

    // 1. Ledger Entry for Invoice
    const previousLedger = await Ledger.findOne({ client }).sort({ createdAt: -1 });
    const currentBalance = previousLedger ? previousLedger.runningBalance : clientDoc.closingBalance || 0;
    const newBalance = currentBalance + total;

    await Ledger.create({
      client,
      date: new Date(),
      transactionType: 'Invoice',
      referenceNumber: invoiceNumber,
      debit: total,
      credit: 0,
      runningBalance: newBalance,
      description: `Tax Invoice Generated: ${serviceType}`
    });

    // 2. If initial payment made, record payment in ledger
    if (paid > 0) {
      const balanceAfterPayment = newBalance - paid;
      await Ledger.create({
        client,
        date: new Date(),
        transactionType: 'Payment Received',
        referenceNumber: `REC-${invoiceNumber}`,
        debit: 0,
        credit: paid,
        runningBalance: balanceAfterPayment,
        description: `Payment received for Invoice ${invoiceNumber}`
      });
      clientDoc.closingBalance = balanceAfterPayment;
    } else {
      clientDoc.closingBalance = newBalance;
    }

    await clientDoc.save();

    // 3. Optional: Move to Task Assignment Workflow
    if (moveToTaskAssignment) {
      let dept = assignedGroup || 'GST';
      if (!assignedGroup) {
        if (serviceType.includes('Book Keeping') || serviceType.includes('Accounting')) dept = 'Book Keeping';
        else if (serviceType.includes('Income Tax') || serviceType.includes('IT')) dept = 'Income Tax';
        else if (serviceType.includes('Registration') || serviceType.includes('Certificate')) dept = 'Registration';
      }

      await Task.create({
        client,
        taskType: 'Client Task',
        department: dept,
        taskName: serviceType,
        priority: taskPriority || 'High',
        assignedBy: req.user._id,
        assignedEmployee: assignedEmployee || clientDoc.responsibleEmployee || req.user._id,
        dueDate: taskDueDate ? new Date(taskDueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        repeat: 'One Time',
        status: 'Assigned',
        remarks: remarks ? `${remarks} (Auto-assigned from Invoice ${invoiceNumber})` : `Auto-assigned from Invoice ${invoiceNumber}`
      });

      invoice.taskCreated = true;
      await invoice.save();
    }

    await logAudit(req.user, 'Invoice Created', 'Billing', `Generated invoice ${invoiceNumber} total ₹${total} for ${clientDoc.clientName}`, req);

    res.status(201).json({ message: 'Invoice generated successfully', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Invoices
exports.getInvoices = async (req, res) => {
  try {
    const { client, paymentStatus, serviceType, search } = req.query;
    let filter = {};

    if (client) filter.client = client;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (serviceType) filter.serviceType = serviceType;
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { serviceType: { $regex: search, $options: 'i' } }
      ];
    }

    const invoices = await Invoice.find(filter)
      .populate('client', 'clientName tradeName gstin pan phone email')
      .sort({ createdAt: -1 });

    // Migrate any legacy invoice numbers (e.g. INV-2026-0001) to clean short format (INV00126)
    for (const inv of invoices) {
      if (inv.invoiceNumber && inv.invoiceNumber.includes('-')) {
        const match = inv.invoiceNumber.match(/INV-(\d{4})-(\d+)/);
        if (match) {
          const year = match[1].slice(-2);
          const counter = String(match[2]).padStart(3, '0');
          inv.invoiceNumber = `INV${counter}${year}`;
          await Invoice.updateOne({ _id: inv._id }, { invoiceNumber: inv.invoiceNumber });
        }
      }
    }

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download Invoice PDF
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    generateInvoicePDF(invoice, invoice.client, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Email Invoice
exports.emailInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await logAudit(req.user, 'Email Invoice', 'Billing', `Emailed invoice ${invoice.invoiceNumber} to ${invoice.client.email}`, req);

    res.json({ message: `Invoice ${invoice.invoiceNumber} emailed successfully to ${invoice.client.email || 'client'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Share WhatsApp Link
exports.getWhatsAppShareLink = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const message = `Hello ${invoice.client.clientName},\n\nYour Tax Invoice *${invoice.invoiceNumber}* from *Vignesh Associates* for *${invoice.serviceType}* is ready.\n\nTotal Amount: ₹${invoice.total.toLocaleString('en-IN')}\nStatus: ${invoice.paymentStatus}\nPending: ₹${invoice.pendingAmount.toLocaleString('en-IN')}\n\nThank you for choosing Vignesh Associates!`;

    const encodedMessage = encodeURIComponent(message);
    const phone = invoice.client.phone ? invoice.client.phone.replace(/[^0-9]/g, '') : '';
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodedMessage}`;

    res.json({ whatsappUrl, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
