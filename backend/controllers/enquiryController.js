const Enquiry = require('../models/Enquiry');
const Task = require('../models/Task');
const User = require('../models/User');
const Client = require('../models/Client');
const Certification = require('../models/Certification');
const { logAudit } = require('../middleware/auditLogger');

// Generate Client Code helper
const generateClientCode = async () => {
  const count = await Client.countDocuments();
  return `CLI-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
};

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
      .populate('convertedTask', 'taskName status dueDate priority')
      .populate('convertedClient', 'clientName tradeName clientCode phone gstin');

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
      .populate('convertedClient', 'clientName tradeName clientCode phone gstin')
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
      .populate('convertedTask')
      .populate('convertedClient');

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
      .populate('convertedTask', 'taskName status dueDate priority')
      .populate('convertedClient', 'clientName tradeName clientCode phone gstin');

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

// Convert Enquiry to Task (with optional Client Registration shortcut)
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
      clientId,
      registerClient,
      clientData
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

    let targetClientId = clientId || null;
    let createdClientObj = null;

    // Handle Client Registration Shortcut
    if (registerClient && clientData) {
      const cName = (clientData.clientName || enquiry.leadName || '').trim();
      const cPhone = (clientData.phone || enquiry.phone || '').trim();
      const cEmail = (clientData.email || enquiry.email || '').trim();
      const cTradeName = (clientData.tradeName || '').trim();
      const cType = clientData.clientType || 'Proprietorship';
      const cPan = clientData.pan ? clientData.pan.trim().toUpperCase() : '';
      const cGstin = clientData.gstin ? clientData.gstin.trim().toUpperCase() : '';
      const cAddress = (clientData.address || '').trim();
      const cCity = (clientData.city || 'Chennai').trim();
      const cState = (clientData.state || 'Tamil Nadu').trim();
      const cPincode = (clientData.pincode || '').trim();

      // Check for existing client with this phone
      let existingClient = null;
      if (cPhone) {
        existingClient = await Client.findOne({
          $or: [
            { phone: cPhone },
            { phone: `+91${cPhone}` },
            { phone: cPhone.replace('+91', '') }
          ]
        });
      }

      if (existingClient) {
        targetClientId = existingClient._id;
        createdClientObj = existingClient;
      } else {
        const clientCode = await generateClientCode();
        createdClientObj = await Client.create({
          clientCode,
          clientName: cName,
          tradeName: cTradeName,
          phone: cPhone,
          email: cEmail,
          clientType: cType,
          pan: cPan,
          gstin: cGstin,
          address: cAddress,
          city: cCity,
          state: cState,
          pincode: cPincode,
          registrationCategory: 'New Client',
          status: 'Active',
          creditLimit: 50000,
          openingBalance: 0,
          createdBy: req.user._id,
          responsibleEmployee: assignedEmployee || req.user._id,
          subscribedServices: (enquiry.services || []).map((s) => ({
            department: taskDept,
            serviceName: s,
            subServiceName: s,
            periodicity: 'Monthly',
            status: 'Active'
          }))
        });

        targetClientId = createdClientObj._id;

        // Automatically create Certification Tracking Record
        try {
          await Certification.create({
            client: createdClientObj._id,
            certificateType: (enquiry.services && enquiry.services.length > 0) ? enquiry.services.join(', ') : 'GST Registration',
            applicationDate: new Date(),
            status: 'Waiting For Certificate',
            certificateReceived: 'No',
            movedToBilling: false,
            noCertificateRequired: false,
            remarks: `Client Registered via Lead Enquiry Conversion for "${cName}"`
          });
        } catch (certErr) {
          console.warn('Certification tracker notice:', certErr.message);
        }

        await logAudit(
          req.user,
          'Create Client',
          'Clients',
          `Registered client "${createdClientObj.clientName}" (${createdClientObj.clientCode}) via enquiry conversion shortcut`,
          req
        );
      }
    }

    const defaultTaskTitle = taskName || `Enquiry Action: ${enquiry.leadName} (${enquiry.services.join(', ')})`;
    const defaultDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

    // Prepare remarks with lead contact context
    const fullRemarks = [
      remarks || '',
      `[Enquiry Details] Lead: ${enquiry.leadName} | Phone: ${enquiry.phone}${enquiry.email ? ` | Email: ${enquiry.email}` : ''}`,
      `Services Requested: ${enquiry.services.join(', ')}`,
      enquiry.notes ? `Lead Notes: ${enquiry.notes}` : '',
      createdClientObj ? `[Client Account Linked]: ${createdClientObj.clientName} (${createdClientObj.clientCode})` : ''
    ]
      .filter(Boolean)
      .join('\n');

    // Create the task in Task board
    const task = await Task.create({
      client: targetClientId,
      taskType: targetClientId ? 'Client Task' : 'Common Task',
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

    // Update enquiry record as Converted and link client if any
    enquiry.status = 'Converted';
    enquiry.convertedTask = task._id;
    if (targetClientId) {
      enquiry.convertedClient = targetClientId;
    }
    enquiry.convertedAt = new Date();
    await enquiry.save();

    await logAudit(
      req.user,
      'Convert Enquiry to Task',
      'Enquiries',
      `Converted enquiry for "${enquiry.leadName}" into task "${task.taskName}" (Task ID: ${task._id})${createdClientObj ? ` & Linked Client: ${createdClientObj.clientName}` : ''}`,
      req
    );

    const updatedEnquiry = await Enquiry.findById(enquiry._id)
      .populate('createdBy', 'name email role department')
      .populate('assignedTo', 'name email role department')
      .populate('convertedTask', 'taskName status dueDate priority assignedEmployee department')
      .populate('convertedClient', 'clientName tradeName clientCode phone gstin');

    res.json({
      message: createdClientObj
        ? `Client "${createdClientObj.clientName}" registered & Task assigned successfully!`
        : 'Enquiry converted to Task successfully',
      task,
      client: createdClientObj,
      enquiry: updatedEnquiry
    });
  } catch (error) {
    console.error('Error converting enquiry to task:', error);
    res.status(500).json({ message: error.message || 'Failed to convert enquiry to task' });
  }
};

