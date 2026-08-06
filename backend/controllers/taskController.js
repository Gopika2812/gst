const Task = require('../models/Task');
const Client = require('../models/Client');
const { logAudit } = require('../middleware/auditLogger');

// Create Task Assignment
exports.createTask = async (req, res) => {
  try {
    const {
      client: clientId,
      department,
      taskName,
      priority,
      assignedEmployee,
      dueDate,
      reminderDays,
      repeat,
      remarks
    } = req.body;

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (client.status !== 'Active') {
      return res.status(400).json({ message: 'Cannot assign task to Inactive or Suspended client' });
    }

    const fileAttachment = req.file ? `/uploads/${req.file.filename}` : null;

    const task = await Task.create({
      client: clientId,
      department,
      taskName,
      priority: priority || 'Medium',
      assignedEmployee: assignedEmployee || req.user._id,
      dueDate,
      reminderDays: reminderDays || 3,
      repeat: repeat || 'One Time',
      status: 'Pending',
      remarks,
      attachment: fileAttachment
    });

    await logAudit(req.user, 'Task Assignment', 'Task Board', `Assigned task ${taskName} to employee ID: ${assignedEmployee}`, req);

    res.status(201).json({ message: 'Task assigned successfully', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Tasks with Date & Status Filters
exports.getTasks = async (req, res) => {
  try {
    const {
      department,
      assignedEmployee,
      status,
      priority,
      client,
      dateFilter,
      startDate,
      endDate,
      myTasksOnly,
      search
    } = req.query;

    let filter = {};

    // Staff sees assigned tasks only if requested or restricted
    if (myTasksOnly === 'true' || ['Registration Team', 'GST Team', 'Book Keeping Team', 'IT Filing Team'].includes(req.user.role)) {
      filter.assignedEmployee = req.user._id;
    } else if (assignedEmployee) {
      filter.assignedEmployee = assignedEmployee;
    }

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (client) filter.client = client;

    // Date Filters
    const now = new Date();
    if (dateFilter === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      filter.dueDate = { $gte: start, $lte: end };
    } else if (dateFilter === 'thisWeek') {
      const first = now.getDate() - now.getDay();
      const start = new Date(now.setDate(first));
      const end = new Date(now.setDate(first + 6));
      filter.dueDate = { $gte: start, $lte: end };
    } else if (dateFilter === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      filter.dueDate = { $gte: start, $lte: end };
    } else if (dateFilter === 'overdue') {
      filter.dueDate = { $lt: now };
      filter.status = { $ne: 'Completed' };
    } else if (startDate && endDate) {
      filter.dueDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (search) {
      filter.$or = [
        { taskName: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('client', 'clientName tradeName pan gstin phone status')
      .populate('assignedEmployee', 'name email role department')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Task Status / Drag & Drop Column Shift
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const task = await Task.findById(req.params.id).populate('client');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;
    task.status = status;
    if (remarks) task.remarks = remarks;

    // Handle file attachment update if uploaded
    if (req.file) {
      task.attachment = `/uploads/${req.file.filename}`;
    }

    await task.save();

    // Auto Task Recurring Trigger on Completion
    if (status === 'Completed' && oldStatus !== 'Completed' && task.repeat !== 'One Time' && task.client && task.client.status === 'Active') {
      const currentDueDate = new Date(task.dueDate);
      let nextDueDate = new Date(currentDueDate);

      if (task.repeat === 'Monthly') nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      else if (task.repeat === 'Quarterly') nextDueDate.setMonth(nextDueDate.getMonth() + 3);
      else if (task.repeat === 'Yearly') nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

      await Task.create({
        client: task.client._id,
        department: task.department,
        taskName: task.taskName,
        priority: task.priority,
        assignedEmployee: task.assignedEmployee,
        dueDate: nextDueDate,
        reminderDays: task.reminderDays,
        repeat: task.repeat,
        status: 'Pending',
        remarks: `Auto-spawned recurring task following completion of ${task.taskName}`,
        isAutoGenerated: true,
        parentTaskId: task._id
      });
    }

    await logAudit(req.user, 'Task Status Update', 'Task Board', `Updated task ${task.taskName} status to ${status}`, req);

    res.json({ message: `Task status updated to ${status}`, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Task (Admin/Super Admin only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await Task.findByIdAndDelete(req.params.id);
    await logAudit(req.user, 'Task Deleted', 'Task Board', `Deleted task: ${task.taskName}`, req);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
