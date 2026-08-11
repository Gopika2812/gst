const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Permission = require('../models/Permission');
const Client = require('../models/Client');
const Certification = require('../models/Certification');
const Invoice = require('../models/Invoice');
const Ledger = require('../models/Ledger');
const Task = require('../models/Task');
const FilingRecord = require('../models/FilingRecord');
const AuditLog = require('../models/AuditLog');

const flushDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://gopikap2812_db_user:DWLr4pJB4wBwdvUo@gstdb.jggkrfo.mongodb.net/auditor_erp';
    await mongoose.connect(mongoUri);
    console.log('[Flush] Connected to MongoDB');

    // 1. Clear sample business data
    const clientResult = await Client.deleteMany({});
    const certResult = await Certification.deleteMany({});
    const invoiceResult = await Invoice.deleteMany({});
    const ledgerResult = await Ledger.deleteMany({});
    const taskResult = await Task.deleteMany({});
    const filingResult = await FilingRecord.deleteMany({});
    const auditResult = await AuditLog.deleteMany({});

    console.log(`[Flush] Deleted ${clientResult.deletedCount} Clients`);
    console.log(`[Flush] Deleted ${certResult.deletedCount} Certifications`);
    console.log(`[Flush] Deleted ${invoiceResult.deletedCount} Invoices`);
    console.log(`[Flush] Deleted ${ledgerResult.deletedCount} Ledgers`);
    console.log(`[Flush] Deleted ${taskResult.deletedCount} Tasks`);
    console.log(`[Flush] Deleted ${filingResult.deletedCount} Filing Records`);
    console.log(`[Flush] Deleted ${auditResult.deletedCount} Audit Logs`);

    // 2. Remove non-Super-Admin users
    const userResult = await User.deleteMany({ email: { $ne: 'superadmin@vigneshassociates.com' } });
    console.log(`[Flush] Deleted ${userResult.deletedCount} Non-Super-Admin Users`);

    // 3. Ensure Super Admin user exists
    let superAdmin = await User.findOne({ email: 'superadmin@vigneshassociates.com' });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'Vigneshwaran CA',
        email: 'superadmin@vigneshassociates.com',
        phone: '+91 98765 43210',
        password: 'admin123',
        role: 'Super Admin',
        status: 'Approved',
        department: 'Management'
      });
      console.log('[Flush] Created Super Admin account (superadmin@vigneshassociates.com / admin123)');
    } else {
      console.log('[Flush] Super Admin account retained (superadmin@vigneshassociates.com)');
    }

    // 4. Ensure Super Admin permissions exist
    const defaultModules = {
      Dashboard: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      Clients: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      Registration: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      Certification: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      Billing: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'GST Filing': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Book Keeping': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'IT Filing': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      Reports: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Task Board': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      Settings: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'User Management': { view: true, create: true, edit: true, delete: true, approve: true, export: true }
    };

    await Permission.deleteMany({ role: { $ne: 'Super Admin' } });
    await Permission.findOneAndUpdate(
      { role: 'Super Admin' },
      { role: 'Super Admin', modules: defaultModules },
      { upsert: true, new: true }
    );
    console.log('[Flush] Permissions updated (Super Admin only)');

    // 5. Create initial audit log entry for the flush action
    await AuditLog.create({
      user: superAdmin._id,
      userName: superAdmin.name,
      userRole: superAdmin.role,
      action: 'Data Flush',
      module: 'System',
      details: 'Flushed all sample data. Retained only Super Admin account.'
    });

    console.log('[Flush] Data flush process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Flush Error]', error);
    process.exit(1);
  }
};

flushDB();
