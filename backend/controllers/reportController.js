const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const Task = require('../models/Task');
const User = require('../models/User');
const Certification = require('../models/Certification');
const Enquiry = require('../models/Enquiry');

// Executive Dashboard Counters & Summary (with Date, Department & User Filtration)
exports.getDashboardSummary = async (req, res) => {
  try {
    const userRole = req.user?.role || '';
    const userDept = req.user?.department || '';
    const userId = req.user?._id;

    const isSuperAdmin = userRole === 'Super Admin';
    const isAdmin = userRole.includes('Admin') && !isSuperAdmin;

    const { dateFilter, startDate, endDate, department, employeeId } = req.query;

    // 1. Calculate Date Range
    const now = new Date();
    let startRange = null;
    let endRange = null;

    if (startDate && endDate) {
      startRange = new Date(startDate);
      startRange.setHours(0, 0, 0, 0);
      endRange = new Date(endDate);
      endRange.setHours(23, 59, 59, 999);
    } else if (dateFilter === 'Today') {
      startRange = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endRange = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (dateFilter === 'This Week') {
      const firstDay = now.getDate() - now.getDay();
      startRange = new Date(now.getFullYear(), now.getMonth(), firstDay, 0, 0, 0);
      endRange = new Date(now.getFullYear(), now.getMonth(), firstDay + 6, 23, 59, 59);
    } else if (dateFilter === 'This Month') {
      startRange = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endRange = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else {
      // Default / 'All Time'
      startRange = null;
      endRange = null;
    }

    // 2. Build Filters
    const taskAndConditions = [];
    let clientFilter = {};
    let invoiceFilter = {};
    let certFilter = {};

    certFilter.noCertificateRequired = { $ne: true };

    const isFirmAdmin = isAdmin && (userDept === 'Administration' || userDept === 'Management');

    // Role-based baseline for tasks
    if (isSuperAdmin || isFirmAdmin) {
      // Super Admin and Firm Admins (Administration/Management) have full firm visibility across departments
    } else if (isAdmin) {
      const deptList = userDept === 'IT Filing' || userDept === 'Income Tax' ? ['IT Filing', 'Income Tax'] : [userDept];
      taskAndConditions.push({
        $or: [
          { department: { $in: deptList } },
          { assignedEmployee: userId },
          { assignedBy: userId }
        ]
      });
      certFilter.department = { $in: deptList };
    } else {
      // Staff / Executive
      const deptList = userDept === 'IT Filing' || userDept === 'Income Tax' ? ['IT Filing', 'Income Tax'] : (userDept ? [userDept] : []);
      taskAndConditions.push({
        $or: [
          { assignedEmployee: userId },
          ...(deptList.length > 0 ? [{ department: { $in: deptList } }] : [])
        ]
      });
      certFilter.responsibleEmployee = userId;
    }

    // Apply explicit Department Filter from UI
    if (department && department !== 'All') {
      const targetDepts = department === 'Income Tax' || department === 'IT Filing' ? ['Income Tax', 'IT Filing'] : [department];
      taskAndConditions.push({ department: { $in: targetDepts } });
      certFilter.department = { $in: targetDepts };
    }

    // Apply explicit Employee Filter from UI
    if (employeeId && employeeId !== 'All') {
      taskAndConditions.push({ assignedEmployee: employeeId });
      certFilter.responsibleEmployee = employeeId;
      clientFilter.responsibleEmployee = employeeId;
      invoiceFilter.assignedEmployee = employeeId;
    }

    // Date range filters
    const clientDateQuery = startRange && endRange ? { createdAt: { $gte: startRange, $lte: endRange } } : {};
    const invoiceDateQuery = startRange && endRange ? { invoiceDate: { $gte: startRange, $lte: endRange } } : {};

    if (startRange && endRange) {
      taskAndConditions.push({ dueDate: { $gte: startRange, $lte: endRange } });
    }

    const finalTaskFilter = taskAndConditions.length === 0
      ? {}
      : taskAndConditions.length === 1
        ? taskAndConditions[0]
        : { $and: taskAndConditions };

    // Parallelize all queries safely
    const [
      totalClients,
      registeredClientsCount,
      activeClients,
      pendingCertificatesCount,
      allFilteredTasks,
      allFilteredInvoices,
      allClientsList,
      allPendingCertificates,
      allEnquiries
    ] = await Promise.all([
      Client.countDocuments(clientFilter).catch(() => 0),
      Client.countDocuments(startRange && endRange ? { ...clientFilter, ...clientDateQuery } : clientFilter).catch(() => 0),
      Client.countDocuments({ ...clientFilter, status: 'Active' }).catch(() => 0),
      Certification.countDocuments({ ...certFilter, status: 'Waiting For Certificate' }).catch(() => 0),
      Task.find(finalTaskFilter)
        .populate('client', 'clientName tradeName gstin pan phone email')
        .populate('assignedEmployee', 'name email role department designation')
        .populate('assignedBy', 'name role')
        .sort({ dueDate: 1, createdAt: -1 })
        .lean()
        .catch(() => []),
      Invoice.find({ ...invoiceFilter, ...invoiceDateQuery })
        .populate('client', 'clientName tradeName gstin pan phone email')
        .populate('assignedEmployee', 'name email role department')
        .sort({ invoiceDate: -1 })
        .lean()
        .catch(() => []),
      Client.find(clientFilter)
        .populate('responsibleEmployee', 'name email department')
        .sort({ createdAt: -1 })
        .lean()
        .catch(() => []),
      Certification.find({ ...certFilter, status: 'Waiting For Certificate' })
        .populate('client', 'clientName tradeName gstin pan phone')
        .populate('assignedEmployee', 'name email department')
        .sort({ createdAt: -1 })
        .lean()
        .catch(() => []),
      Enquiry.find()
        .populate('createdBy', 'name email role department')
        .populate('assignedTo', 'name email role department')
        .populate('convertedTask', 'taskName status dueDate priority')
        .populate('convertedClient', 'clientName tradeName clientCode phone gstin')
        .sort({ createdAt: -1 })
        .lean()
        .catch(() => [])
    ]);

    const tasksList = allFilteredTasks || [];
    const invoicesList = allFilteredInvoices || [];
    const enquiriesList = allEnquiries || [];

    // Compute Task Process Counters from filtered tasks
    const todaysTasks = tasksList.filter((t) => {
      if (!t) return false;
      const created = t.createdAt ? new Date(t.createdAt) : null;
      const due = t.dueDate ? new Date(t.dueDate) : null;
      const isToday = (d) => d && !isNaN(d.getTime()) && d.toDateString() === now.toDateString();
      return isToday(created) || isToday(due) || t.status === 'Assigned';
    });

    const inProgressTasks = tasksList.filter((t) => t && t.status === 'In Progress');
    const completedTasks = tasksList.filter((t) => t && t.status === 'Completed');
    const cantCompleteTasks = tasksList.filter((t) => t && (t.status === "Can't Complete" || t.status === 'On Hold'));
    const overdueTasks = tasksList.filter((t) => {
      if (!t || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      return !isNaN(due.getTime()) && due < now && t.status !== 'Completed' && t.status !== "Can't Complete";
    });

    // Compute Enquiries Counters (Today, In Progress, Converted, Completed)
    const todaysEnquiries = enquiriesList.filter((e) => {
      if (!e) return false;
      const created = e.createdAt ? new Date(e.createdAt) : null;
      const isToday = (d) => d && !isNaN(d.getTime()) && d.toDateString() === now.toDateString();
      return isToday(created) || e.status === 'New';
    });
    const inProgressEnquiries = enquiriesList.filter((e) => e && (e.status === 'In Discussion' || e.status === 'In Progress'));
    const convertedEnquiries = enquiriesList.filter((e) => e && (e.status === 'Converted' || Boolean(e.convertedTask)));
    const completedEnquiries = enquiriesList.filter((e) => e && (e.status === 'Closed' || e.status === 'Completed'));

    // Billing Counters
    const totalBillingValue = invoicesList.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    const totalCollected = invoicesList.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);
    const totalPending = invoicesList.reduce((sum, inv) => sum + (Number(inv.pendingAmount) || 0), 0);

    res.json({
      counters: {
        totalClients: totalClients || 0,
        registeredClientsCount: registeredClientsCount || 0,
        activeClients: activeClients || 0,
        pendingCertificatesCount: pendingCertificatesCount || 0,
        todaysTasksCount: todaysTasks.length,
        inProgressTasksCount: inProgressTasks.length,
        completedTasksCount: completedTasks.length,
        cantCompleteTasksCount: cantCompleteTasks.length,
        overdueTasksCount: overdueTasks.length,
        todaysEnquiriesCount: todaysEnquiries.length,
        inProgressEnquiriesCount: inProgressEnquiries.length,
        convertedEnquiriesCount: convertedEnquiries.length,
        completedEnquiriesCount: completedEnquiries.length,
        totalEnquiriesCount: enquiriesList.length,
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
        todaysEnquiries,
        inProgressEnquiries,
        convertedEnquiries,
        completedEnquiries,
        allEnquiries: enquiriesList,
        allFilteredTasks: tasksList,
        allFilteredInvoices: invoicesList,
        allClientsList: allClientsList || [],
        allPendingCertificates: allPendingCertificates || []
      }
    });
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
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
