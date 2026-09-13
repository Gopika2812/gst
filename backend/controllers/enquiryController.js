const Enquiry = require('../models/Enquiry');
const Task = require('../models/Task');
const User = require('../models/User');
const { logAudit } = require('../middleware/auditLogger');

// Create New Lead Enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const { leadName, phone, email, services, priority, status, notes, assignedTo } = req.body;

    if (!leadName || !leadName.trim()) {
      return res.status(400).json({ message: 'Lead Name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone Number is required' });
    }
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: 'Please select at least one service' });
    }

    const enquiry = await Enquiry.create({
      leadName: leadName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      services,
      priority: priority || 'Medium',
      status: status || 'New',
      notes: notes ? notes.trim() : '',
      assignedTo: assignedTo || null,
      createdBy: req.user ? req.user._id : null
    });

    await logAudit(
      req.user,
      'Create Enquiry',
      'Enquiries',
      `Created enquiry for lead "${leadName.trim()}" with services: ${services.join(', ')}`,
      req
    );

    const populatedEnquiry = await Enquiry.findById(enquiry._id)
      .populate('createdBy', 'name email role department')
      .populate('assignedTo', 'name email role department')
      .populate('convertedTask', 'taskName status dueDate priority');

    res.status(201).json({ message: 'Enquiry created successfully', enquiry: populatedEnquiry });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ message: error.message || 'Failed to create enquiry' });
  }
};

// Get All Enquiries with filtering & search
exports.getEnquiries = async (req, res) => {
  try {
    const { status, service, search, priority } = req.query;

    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (service && service !== 'All') {
      filter.services = { $in: [service] };
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { leadName: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } },
        { services: { $elemMatch: { $regex: q, $options: 'i' } } }
      ];
    }

    const enquiries = await Enquiry.find(filter)
      .populate('createdBy', 'name email role department')
      .populate('assignedTo', 'name email role department')
      .populate('convertedTask', 'taskName status dueDate priority assignedEmployee department')
      .sort({ createdAt: -1 })
      .lean();

    res.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch enquiries' });
  }
};

// Get Single Enquiry By ID
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id)
      .populate('createdBy', 'name email role department')
      .populate('assignedTo', 'name email role department')
      .populate('convertedTask');

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch enquiry' });
  }
};

// Update Enquiry
exports.updateEnquiry = async (req, res) => {
  try {
    const { leadName, phone, email, services, priority, status, notes, assignedTo } = req.body;

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    if (leadName !== undefined) enquiry.leadName = leadName.trim();
    if (phone !== undefined) enquiry.phone = phone.trim();
    if (email !== undefined) enquiry.email = email.trim();
    if (services !== undefined) enquiry.services = services;
    if (priority !== undefined) enquiry.priority = priority;
    if (status !== undefined) enquiry.status = status;
    if (notes !== undefined) enquiry.notes = notes.trim();
    if (assignedTo !== undefined) enquiry.assignedTo = assignedTo || null;

    await enquiry.save();

    await logAudit(
      req.user,
      'Update Enquiry',
      'Enquiries',
      `Updated enquiry for lead "${enquiry.leadName}" (Status: ${enquiry.status})`,
      req
    );

    const updatedEnquiry = await Enquiry.findById(enquiry._id)
      .populate('createdBy', 'name email role department')
      .populate('assignedTo', 'name email role department')
      .populate('convertedTask', 'taskName status dueDate priority');

    res.json({ message: 'Enquiry updated successfully', enquiry: updatedEnquiry });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({ message: error.message || 'Failed to update enquiry' });
  }
};

// Delete Enquiry
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    await Enquiry.findByIdAndDelete(req.params.id);

    await logAudit(
      req.user,
      'Delete Enquiry',
      'Enquiries',
      `Deleted enquiry for lead "${enquiry.leadName}"`,
      req
    );

    res.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({ message: error.message || 'Failed to delete enquiry' });
  }
};

// Convert Enquiry to Task
exports.convertToTask = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    const {
      taskName,
      department,
      priority,
      assignedEmployee,
      dueDate,
      reminderDays,
      repeat,
      remarks,
      clientId
    } = req.body;

    // Determine default department based on enquiry services if not explicitly provided
    let taskDept = department;
    if (!taskDept) {
      const firstService = enquiry.services[0] || '';
      if (firstService.toLowerCase().includes('gst')) taskDept = 'GST';
      else if (firstService.toLowerCase().includes('tax') || firstService.toLowerCase().includes('itr')) taskDept = 'Income Tax';
      else if (firstService.toLowerCase().includes('book') || firstService.toLowerCase().includes('account')) taskDept = 'Accounts';
      else taskDept = 'Administration';
    }

    const defaultTaskTitle = taskName || `Enquiry Follow-up: ${enquiry.leadName} (${enquiry.services.join(', ')})`;
    const defaultDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

    // Prepare remarks with lead contact context
    const fullRemarks = [
      remarks || '',
      `[Enquiry Details] Lead: ${enquiry.leadName} | Phone: ${enquiry.phone}${enquiry.email ? ` | Email: ${enquiry.email}` : ''}`,
      `Services Requested: ${enquiry.services.join(', ')}`,
      enquiry.notes ? `Lead Notes: ${enquiry.notes}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    // Create the task in Task board
    const task = await Task.create({
      client: clientId || null,
      taskType: clientId ? 'Client Task' : 'Common Task',
      department: taskDept,
      taskName: defaultTaskTitle,
      priority: priority || enquiry.priority || 'Medium',
      assignedBy: req.user._id,
      assignedEmployee: assignedEmployee || req.user._id,
      dueDate: defaultDueDate,
      reminderDays: reminderDays || 2,
      repeat: repeat || 'One Time',
      status: 'Assigned',
      remarks: fullRemarks
    });

    // Update enquiry record as Converted
    enquiry.status = 'Converted';
    enquiry.convertedTask = task._id;
    enquiry.convertedAt = new Date();
    await enquiry.save();

    await logAudit(
      req.user,
      'Convert Enquiry to Task',
      'Enquiries',
      `Converted enquiry for "${enquiry.leadName}" into task "${task.taskName}" (Task ID: ${task._id})`,
      req
    );

    const updatedEnquiry = await Enquiry.findById(enquiry._id)
      .populate('createdBy', 'name email role department')
      .populate('assignedTo', 'name email role department')
      .populate('convertedTask', 'taskName status dueDate priority assignedEmployee department');

    res.json({
      message: 'Enquiry converted to Task successfully',
      task,
      enquiry: updatedEnquiry
    });
  } catch (error) {
    console.error('Error converting enquiry to task:', error);
    res.status(500).json({ message: error.message || 'Failed to convert enquiry to task' });
  }
};
