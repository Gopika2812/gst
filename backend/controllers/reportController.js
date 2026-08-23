const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const Task = require('../models/Task');
const User = require('../models/User');
const Certification = require('../models/Certification');

// Executive Dashboard Counters & Summary (Optimized with Concurrent Execution & Lean Queries)
exports.getDashboardSummary = async (req, res) => {
  try {
    const userRole = req.user.role || '';
    const userDept = req.user.department || '';
    const userId = req.user._id;

    const isSuperAdmin = userRole === 'Super Admin';
    const isAdmin = userRole.includes('Admin') && !isSuperAdmin;

    let clientFilter = {};
    let taskFilter = {};
    let certFilter = {};
    let recentTaskFilter = {};

    if (isSuperAdmin) {
      clientFilter = {};
      taskFilter = {};
      certFilter = {};
      recentTaskFilter = {};
    } else if (isAdmin) {
      clientFilter = {};
      taskFilter = {
        $or: [
          { department: userDept },
          { assignedEmployee: userId },
          { assignedBy: userId }
        ]
      };
      certFilter = {};
      recentTaskFilter = taskFilter;
    } else {
      clientFilter = {};
      taskFilter = { assignedEmployee: userId };
      certFilter = { assignedEmployee: userId };
      recentTaskFilter = { assignedEmployee: userId };
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Parallelize all database queries concurrently
    const [
      totalClients,
      activeClients,
      inactiveClients,
      pendingCertificates,
      todaysTasksCount,
      pendingTasksCount,
      inProgressTasksCount,
      completedTasksCount,
      cantCompleteTasksCount,
      overdueTasksCount,
      invoices,
      recentTasks
    ] = await Promise.all([
      Client.countDocuments(clientFilter),
      Client.countDocuments({ ...clientFilter, status: 'Active' }),
      Client.countDocuments({ ...clientFilter, status: 'Inactive' }),
      Certification.countDocuments({ status: 'Waiting For Certificate' }),
      Task.countDocuments({
        ...taskFilter,
        $or: [
          { createdAt: { $gte: startOfToday, $lte: endOfToday } },
          { assignedDate: { $gte: startOfToday, $lte: endOfToday } },
          { dueDate: { $gte: startOfToday, $lte: endOfToday } }
        ]
      }),
      Task.countDocuments({ ...taskFilter, status: { $in: ['Assigned', 'Pending'] } }),
      Task.countDocuments({ ...taskFilter, status: 'In Progress' }),
      Task.countDocuments({ ...taskFilter, status: 'Completed' }),
      Task.countDocuments({ ...taskFilter, status: { $in: ["Can't Complete", 'On Hold', 'Waiting', 'Cancelled'] } }),
      Task.countDocuments({ ...taskFilter, dueDate: { $lt: now }, status: { $nin: ['Completed', 'Cancelled'] } }),
      (isSuperAdmin || isAdmin) ? Invoice.find().select('total paidAmount pendingAmount').lean() : Promise.resolve([]),
      Task.find(recentTaskFilter)
        .populate('client', 'clientName')
        .populate('assignedEmployee', 'name role department')
        .populate('assignedBy', 'name role')
        .sort({ updatedAt: -1 })
        .limit(6)
        .lean()
    ]);

    // Revenue Metrics
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.pendingAmount || 0), 0);

    // Monthly Performance Data
    const monthlyRevenue = [
      { month: 'Mar', revenue: 145000, collected: 130000, tasks: 42 },
      { month: 'Apr', revenue: 180000, collected: 175000, tasks: 58 },
      { month: 'May', revenue: 210000, collected: 190000, tasks: 65 },
      { month: 'Jun', revenue: 195000, collected: 185000, tasks: 60 },
      { month: 'Jul', revenue: 240000, collected: 220000, tasks: 78 },
      { month: 'Aug', revenue: totalRevenue, collected: totalCollected, tasks: completedTasksCount + pendingTasksCount }
    ];

    res.json({
      counters: {
        totalClients,
        activeClients,
        inactiveClients,
        pendingCertificates,
        todaysTasksCount,
        pendingTasksCount,
        inProgressTasksCount,
        completedTasksCount,
        cantCompleteTasksCount,
        overdueTasksCount,
        totalRevenue,
        totalCollected,
        totalOutstanding
      },
      monthlyRevenue,
      recentTasks
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
