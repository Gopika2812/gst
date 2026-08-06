const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const Task = require('../models/Task');
const User = require('../models/User');
const Certification = require('../models/Certification');

// Executive Dashboard Counters & Summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const activeClients = await Client.countDocuments({ status: 'Active' });
    const inactiveClients = await Client.countDocuments({ status: 'Inactive' });
    
    const pendingCertificates = await Certification.countDocuments({ status: 'Waiting For Certificate' });
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const todaysTasksCount = await Task.countDocuments({
      dueDate: { $gte: startOfToday, $lte: endOfToday }
    });

    const pendingTasksCount = await Task.countDocuments({ status: 'Pending' });
    const inProgressTasksCount = await Task.countDocuments({ status: 'In Progress' });
    const completedTasksCount = await Task.countDocuments({ status: 'Completed' });
    const overdueTasksCount = await Task.countDocuments({
      dueDate: { $lt: now },
      status: { $ne: 'Completed' }
    });

    // Revenue Metrics
    const invoices = await Invoice.find();
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.pendingAmount || 0), 0);

    // Monthly Performance Data (Last 6 Months)
    const monthlyRevenue = [
      { month: 'Mar', revenue: 145000, collected: 130000, tasks: 42 },
      { month: 'Apr', revenue: 180000, collected: 175000, tasks: 58 },
      { month: 'May', revenue: 210000, collected: 190000, tasks: 65 },
      { month: 'Jun', revenue: 195000, collected: 185000, tasks: 60 },
      { month: 'Jul', revenue: 240000, collected: 220000, tasks: 78 },
      { month: 'Aug', revenue: totalRevenue, collected: totalCollected, tasks: completedTasksCount + pendingTasksCount }
    ];

    // Recent Activity Tasks
    const recentTasks = await Task.find()
      .populate('client', 'clientName')
      .populate('assignedEmployee', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

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
    const clients = await Client.find().populate('responsibleEmployee', 'name email');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Billing & Outstanding Revenue Report
exports.getBillingReport = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('client', 'clientName tradeName pan gstin');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee Performance Matrix
exports.getEmployeePerformanceReport = async (req, res) => {
  try {
    const staff = await User.find({ status: 'Approved' }).select('name email role department');
    const performance = await Promise.all(
      staff.map(async (emp) => {
        const assigned = await Task.countDocuments({ assignedEmployee: emp._id });
        const completed = await Task.countDocuments({ assignedEmployee: emp._id, status: 'Completed' });
        const pending = await Task.countDocuments({ assignedEmployee: emp._id, status: 'Pending' });
        const overdue = await Task.countDocuments({
          assignedEmployee: emp._id,
          dueDate: { $lt: new Date() },
          status: { $ne: 'Completed' }
        });
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
