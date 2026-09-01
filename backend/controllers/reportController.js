const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const Task = require('../models/Task');
const User = require('../models/User');
const Certification = require('../models/Certification');

// Executive Dashboard Counters & Summary (with Date, Department & User Filtration)
exports.getDashboardSummary = async (req, res) => {
  try {
    const userRole = req.user.role || '';
    const userDept = req.user.department || '';
    const userId = req.user._id;

    const isSuperAdmin = userRole === 'Super Admin';
    const isAdmin = userRole.includes('Admin') && !isSuperAdmin;

    const { dateFilter, startDate, endDate, department, employeeId } = req.query;

    // 1. Calculate Date Range
    const now = new Date();
    let startRange = null;
    let endRange = null;

    if (dateFilter === 'Today' || !dateFilter) {
      startRange = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endRange = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (dateFilter === 'This Week') {
      const firstDay = now.getDate() - now.getDay();
      startRange = new Date(now.getFullYear(), now.getMonth(), firstDay, 0, 0, 0);
      endRange = new Date(now.getFullYear(), now.getMonth(), firstDay + 6, 23, 59, 59);
    } else if (dateFilter === 'This Month') {
      startRange = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endRange = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (dateFilter === 'Custom' && startDate && endDate) {
      startRange = new Date(startDate);
      startRange.setHours(0, 0, 0, 0);
      endRange = new Date(endDate);
      endRange.setHours(23, 59, 59, 999);
    }

    // 2. Build Filters
    let taskFilter = {};
    let clientFilter = {};
    let invoiceFilter = {};
    let certFilter = {};

    // Role-based baseline
    if (isSuperAdmin) {
      // Super Admin sees everything
    } else if (isAdmin) {
      taskFilter.department = userDept;
      certFilter.department = userDept;
    } else {
      taskFilter.assignedEmployee = userId;
      certFilter.assignedEmployee = userId;
      invoiceFilter.assignedEmployee = userId;
    }

    // Department Filter
    if (department && department !== 'All') {
      taskFilter.department = department;
      certFilter.department = department;
    }

    // Employee Filter
    if (employeeId && employeeId !== 'All') {
      taskFilter.assignedEmployee = employeeId;
      invoiceFilter.assignedEmployee = employeeId;
      clientFilter.responsibleEmployee = employeeId;
    }

    // Date Filters
    let taskDateQuery = {};
    let clientDateQuery = {};
    let invoiceDateQuery = {};

    if (startRange && endRange) {
      taskDateQuery = {
        $or: [
          { dueDate: { $gte: startRange, $lte: endRange } },
          { createdAt: { $gte: startRange, $lte: endRange } }
        ]
      };
      clientDateQuery = { createdAt: { $gte: startRange, $lte: endRange } };
      invoiceDateQuery = { invoiceDate: { $gte: startRange, $lte: endRange } };
    }

    // Parallelize all queries concurrently
    const [
      totalClients,
      registeredClientsCount,
      activeClients,
      pendingCertificatesCount,
      allFilteredTasks,
      allFilteredInvoices,
      allClientsList,
      allPendingCertificates
    ] = await Promise.all([
      Client.countDocuments(clientFilter),
      Client.countDocuments({ ...clientFilter, ...clientDateQuery }),
      Client.countDocuments({ ...clientFilter, status: 'Active' }),
      Certification.countDocuments({ ...certFilter, status: 'Waiting For Certificate' }),
      Task.find({ ...taskFilter, ...taskDateQuery })
        .populate('client', 'clientName tradeName gstin pan phone email')
        .populate('assignedEmployee', 'name email role department designation')
        .populate('assignedBy', 'name role')
        .sort({ dueDate: 1, createdAt: -1 })
        .lean(),
      Invoice.find({ ...invoiceFilter, ...invoiceDateQuery })
        .populate('client', 'clientName tradeName gstin pan phone email')
        .populate('assignedEmployee', 'name email role department')
        .sort({ invoiceDate: -1 })
        .lean(),
      Client.find(clientFilter)
        .populate('responsibleEmployee', 'name email department')
        .sort({ createdAt: -1 })
        .lean(),
      Certification.find({ ...certFilter, status: 'Waiting For Certificate' })
        .populate('client', 'clientName tradeName gstin pan phone')
        .populate('assignedEmployee', 'name email department')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    // Compute Task Process Counters from filtered tasks
    const todaysTasks = allFilteredTasks.filter((t) => {
      const created = new Date(t.createdAt);
      const due = new Date(t.dueDate);
      const isToday = (d) => d.toDateString() === now.toDateString();
      return isToday(created) || isToday(due) || t.status === 'Assigned';
    });

    const inProgressTasks = allFilteredTasks.filter((t) => t.status === 'In Progress');
    const completedTasks = allFilteredTasks.filter((t) => t.status === 'Completed');
    const cantCompleteTasks = allFilteredTasks.filter((t) => t.status === "Can't Complete" || t.status === 'On Hold');
    const overdueTasks = allFilteredTasks.filter((t) => new Date(t.dueDate) < now && t.status !== 'Completed' && t.status !== "Can't Complete");

    // Billing Counters
    const totalBillingValue = allFilteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalCollected = allFilteredInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const totalPending = allFilteredInvoices.reduce((sum, inv) => sum + (inv.pendingAmount || 0), 0);

    res.json({
      counters: {
        totalClients,
        registeredClientsCount,
        activeClients,
        pendingCertificatesCount,
        todaysTasksCount: todaysTasks.length,
        inProgressTasksCount: inProgressTasks.length,
        completedTasksCount: completedTasks.length,
        cantCompleteTasksCount: cantCompleteTasks.length,
        overdueTasksCount: overdueTasks.length,
        totalBillingValue,
        totalCollected,
        totalPending
      },
      details: {
        todaysTasks,
        inProgressTasks,
        completedTasks,
        cantCompleteTasks,
        overdueTasks,
        allFilteredTasks,
        allFilteredInvoices,
        allClientsList,
        allPendingCertificates
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Client Report
exports.getClientReport = async (req, res) => {
  try {
    const clients = await Client.find().populate('responsibleEmployee', 'name email').lean();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Billing & Outstanding Revenue Report
exports.getBillingReport = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('client', 'clientName tradeName pan gstin').lean();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee Performance Matrix
exports.getEmployeePerformanceReport = async (req, res) => {
  try {
    const staff = await User.find({ status: 'Approved' }).select('name email role department').lean();
    const performance = await Promise.all(
      staff.map(async (emp) => {
        const [assigned, completed, pending, overdue] = await Promise.all([
          Task.countDocuments({ assignedEmployee: emp._id }),
          Task.countDocuments({ assignedEmployee: emp._id, status: 'Completed' }),
          Task.countDocuments({ assignedEmployee: emp._id, status: 'Pending' }),
          Task.countDocuments({
            assignedEmployee: emp._id,
            dueDate: { $lt: new Date() },
            status: { $ne: 'Completed' }
          })
        ]);
        const completionRate = assigned > 0 ? Math.round((completed / assigned) * 100) : 100;

        return {
          employee: emp,
          assigned,
          completed,
          pending,
          overdue,
          completionRate
        };
      })
    );
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
