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

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://gopikap2812_db_user:DWLr4pJB4wBwdvUo@gstdb.jggkrfo.mongodb.net/auditor_erp';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing collections
    await User.deleteMany({});
    await Permission.deleteMany({});
    await Client.deleteMany({});
    await Certification.deleteMany({});
    await Invoice.deleteMany({});
    await Ledger.deleteMany({});
    await Task.deleteMany({});
    await FilingRecord.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('[Seed] Cleared existing data');

    // 1. Seed Users
    const superAdmin = await User.create({
      name: 'Vigneshwaran CA',
      email: 'superadmin@vigneshassociates.com',
      phone: '+91 98765 43210',
      password: 'admin123',
      role: 'Super Admin',
      status: 'Approved',
      department: 'Management'
    });

    const adminUser = await User.create({
      name: 'Anitha Manager',
      email: 'admin@vigneshassociates.com',
      phone: '+91 98765 43211',
      password: 'admin123',
      role: 'Admin',
      status: 'Approved',
      department: 'Management'
    });

    const gstStaff = await User.create({
      name: 'Kumar Swamy',
      email: 'kumar@vigneshassociates.com',
      phone: '+91 98765 43212',
      password: 'admin123',
      role: 'GST Team',
      status: 'Approved',
      department: 'GST'
    });

    const bookStaff = await User.create({
      name: 'Priya Ramesh',
      email: 'priya@vigneshassociates.com',
      phone: '+91 98765 43213',
      password: 'admin123',
      role: 'Book Keeping Team',
      status: 'Approved',
      department: 'Book Keeping'
    });

    const itStaff = await User.create({
      name: 'Karthik Raja',
      email: 'karthik@vigneshassociates.com',
      phone: '+91 98765 43214',
      password: 'admin123',
      role: 'IT Filing Team',
      status: 'Approved',
      department: 'IT Filing'
    });

    const regStaff = await User.create({
      name: 'Deepa Sundaram',
      email: 'deepa@vigneshassociates.com',
      phone: '+91 98765 43215',
      password: 'admin123',
      role: 'Registration Team',
      status: 'Approved',
      department: 'Registration'
    });

    const pendingUser = await User.create({
      name: 'Suresh NewStaff',
      email: 'suresh@vigneshassociates.com',
      phone: '+91 98765 43216',
      password: 'admin123',
      role: 'GST Team',
      status: 'Pending Approval',
      department: 'GST'
    });

    console.log('[Seed] Users created');

    // 2. Seed Permissions
    const defaultModules = {
      Dashboard: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      Clients: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      Registration: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      Certification: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      Billing: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      'GST Filing': { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      'Book Keeping': { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      'IT Filing': { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      Reports: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      'Task Board': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      Settings: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'User Management': { view: true, create: true, edit: true, delete: true, approve: true, export: true }
    };

    await Permission.create({ role: 'Super Admin', modules: defaultModules });
    await Permission.create({ role: 'Admin', modules: defaultModules });

    console.log('[Seed] Permissions created');

    // 3. Seed Clients
    const client1 = await Client.create({
      clientCode: 'CLI-2026-0001',
      clientName: 'Apex Logistics Solutions Pvt Ltd',
      phone: '+91 98400 11223',
      email: 'finance@apexlogistics.com',
      clientGroup: 'Corporate',
      clientType: 'Private Limited',
      responsibleEmployee: gstStaff._id,
      leadSource: 'Referral',
      registrationCategory: 'Registered Client',
      tradeName: 'Apex Express Lines',
      businessType: 'Logistics & Transport',
      cin: 'U60200TN2021PTC145890',
      dateOfIncorporation: new Date('2021-04-15'),
      pan: 'AAACA1234F',
      tan: 'CHEA12345B',
      gstin: '33AAACA1234F1Z5',
      gstType: 'Regular',
      state: 'Tamil Nadu',
      address: 'No 45, Mount Road, Guindy',
      contactPerson: 'Mr. Ramesh Sundaram',
      billingAddress: 'No 45, Mount Road, Guindy, Chennai 600032',
      city: 'Chennai',
      pincode: '600032',
      openingBalance: 25000,
      creditLimit: 100000,
      closingBalance: 42700,
      status: 'Active',
      createdBy: superAdmin._id
    });

    const client2 = await Client.create({
      clientCode: 'CLI-2026-0002',
      clientName: 'Green Leaf Organic Organics',
      phone: '+91 98411 99887',
      email: 'info@greenleaf.in',
      clientGroup: 'Retail',
      clientType: 'Proprietorship',
      responsibleEmployee: bookStaff._id,
      leadSource: 'Google Search',
      registrationCategory: 'New Client',
      tradeName: 'Green Leaf Superstore',
      businessType: 'Retail FMCG',
      pan: 'BPRPG5432K',
      gstin: '33BPRPG5432K1Z9',
      gstType: 'Regular',
      state: 'Tamil Nadu',
      address: '12th Main Road, Anna Nagar',
      contactPerson: 'Mrs. Geetha Venkatesh',
      city: 'Chennai',
      pincode: '600040',
      openingBalance: 0,
      creditLimit: 50000,
      closingBalance: 11800,
      status: 'Active',
      createdBy: superAdmin._id
    });

    const client3 = await Client.create({
      clientCode: 'CLI-2026-0003',
      clientName: 'TechVibe Innovations LLP',
      phone: '+91 97900 33445',
      email: 'accounts@techvibe.io',
      clientGroup: 'IT & Software',
      clientType: 'LLP',
      responsibleEmployee: itStaff._id,
      leadSource: 'Direct',
      registrationCategory: 'Registered Client',
      tradeName: 'TechVibe Software Solutions',
      llpin: 'AAB-9988',
      pan: 'AAIFT8877L',
      gstin: '33AAIFT8877L1Z2',
      gstType: 'Regular',
      state: 'Tamil Nadu',
      address: 'OMR IT Expressway, Perungudi',
      contactPerson: 'Mr. Arvind Kumar',
      city: 'Chennai',
      pincode: '600096',
      openingBalance: 15000,
      creditLimit: 75000,
      closingBalance: 29500,
      status: 'Active',
      createdBy: superAdmin._id
    });

    console.log('[Seed] Clients created');

    // 4. Seed Certifications
    await Certification.create({
      client: client2._id,
      certificateType: 'GST Registration',
      status: 'Certificate Received',
      applicationDate: new Date('2026-07-01'),
      expectedDate: new Date('2026-07-10'),
      certificateNumber: '33BPRPG5432K1Z9',
      certificateReceived: 'Yes',
      receivedDate: new Date('2026-07-08'),
      movedToBilling: true,
      remarks: 'GST Certificate issued successfully by CBIC portal'
    });

    await Certification.create({
      client: client1._id,
      certificateType: 'FSSAI License Renewal',
      status: 'Waiting For Certificate',
      applicationDate: new Date('2026-08-01'),
      expectedDate: new Date('2026-08-15'),
      certificateReceived: 'No',
      remarks: 'Submitted document proofs; awaiting inspector verification'
    });

    console.log('[Seed] Certifications created');

    // 5. Seed Invoices & Ledgers
    const inv1 = await Invoice.create({
      invoiceNumber: 'INV-2026-0001',
      invoiceDate: new Date('2026-07-15'),
      client: client1._id,
      serviceType: 'GST Filing GSTR-3B & GSTR-1',
      items: [
        { description: 'Monthly GSTR-3B Filing Fee', amount: 10000 },
        { description: 'GSTR-1 Data Processing', amount: 5000 }
      ],
      subTotal: 15000,
      gstPercent: 18,
      gstAmount: 2700,
      discount: 0,
      total: 17700,
      paidAmount: 0,
      pendingAmount: 17700,
      paymentStatus: 'Pending',
      paymentMode: 'Bank Transfer',
      remarks: 'Payment due within 15 days',
      moveToTaskAssignment: true,
      taskCreated: true,
      createdBy: superAdmin._id
    });

    await Ledger.create({
      client: client1._id,
      date: new Date('2026-07-15'),
      transactionType: 'Invoice',
      referenceNumber: 'INV-2026-0001',
      debit: 17700,
      credit: 0,
      runningBalance: 42700,
      description: 'Tax Invoice Generated: GST Filing'
    });

    const inv2 = await Invoice.create({
      invoiceNumber: 'INV-2026-0002',
      invoiceDate: new Date('2026-07-20'),
      client: client2._id,
      serviceType: 'Monthly Book Keeping & Reconciliation',
      items: [{ description: 'Bookkeeping Services for July 2026', amount: 10000 }],
      subTotal: 10000,
      gstPercent: 18,
      gstAmount: 1800,
      discount: 0,
      total: 11800,
      paidAmount: 11800,
      pendingAmount: 0,
      paymentStatus: 'Paid',
      paymentMode: 'UPI',
      remarks: 'Paid via GPay',
      moveToTaskAssignment: true,
      taskCreated: true,
      createdBy: superAdmin._id
    });

    await Ledger.create({
      client: client2._id,
      date: new Date('2026-07-20'),
      transactionType: 'Invoice',
      referenceNumber: 'INV-2026-0002',
      debit: 11800,
      credit: 0,
      runningBalance: 11800,
      description: 'Tax Invoice: Monthly Book Keeping'
    });

    await Ledger.create({
      client: client2._id,
      date: new Date('2026-07-21'),
      transactionType: 'Payment Received',
      referenceNumber: 'UPI-REC-998822',
      debit: 0,
      credit: 11800,
      runningBalance: 0,
      description: 'UPI Payment Received for INV-2026-0002'
    });

    console.log('[Seed] Invoices & Ledgers created');

    // 6. Seed Tasks
    const today = new Date();

    await Task.create({
      client: client1._id,
      department: 'GST',
      taskName: 'GSTR3B Filing - July 2026',
      priority: 'Critical',
      assignedEmployee: gstStaff._id,
      dueDate: new Date(today.getFullYear(), today.getMonth(), 20),
      repeat: 'Monthly',
      status: 'Pending',
      remarks: 'Collect sales and ITC summary sheets'
    });

    await Task.create({
      client: client1._id,
      department: 'GST',
      taskName: 'GSTR1 Monthly Return - July 2026',
      priority: 'High',
      assignedEmployee: gstStaff._id,
      dueDate: new Date(today.getFullYear(), today.getMonth(), 11),
      repeat: 'Monthly',
      status: 'In Progress',
      remarks: 'E-way bill cross checking under process'
    });

    await Task.create({
      client: client2._id,
      department: 'Book Keeping',
      taskName: 'Monthly Accounting & Bank Reconciliation',
      priority: 'Medium',
      assignedEmployee: bookStaff._id,
      dueDate: new Date(today.getFullYear(), today.getMonth(), 15),
      repeat: 'Monthly',
      status: 'Completed',
      remarks: 'Bank statement matched with tally ledger'
    });

    await Task.create({
      client: client3._id,
      department: 'IT Filing',
      taskName: 'Tax Audit & ITR Form 5 Submission',
      priority: 'Critical',
      assignedEmployee: itStaff._id,
      dueDate: new Date(today.getFullYear(), today.getMonth(), 30),
      repeat: 'Yearly',
      status: 'Pending',
      remarks: 'Prepare 3CD audit report disclosures'
    });

    await Task.create({
      client: client2._id,
      department: 'Registration',
      taskName: 'Udyam Certificate MSME Registration',
      priority: 'High',
      assignedEmployee: regStaff._id,
      dueDate: new Date(today.getFullYear(), today.getMonth(), 10),
      repeat: 'One Time',
      status: 'Completed',
      remarks: 'Certificate generated successfully'
    });

    console.log('[Seed] Tasks created');

    // 7. Seed Audit Logs
    await AuditLog.create({
      user: superAdmin._id,
      userName: superAdmin.name,
      userRole: superAdmin.role,
      action: 'System Initialization',
      module: 'System',
      details: 'Database seeded with default users, clients, invoices, and tasks'
    });

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDB();
