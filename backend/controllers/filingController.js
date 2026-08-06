const FilingRecord = require('../models/FilingRecord');
const Task = require('../models/Task');
const { logAudit } = require('../middleware/auditLogger');

// Create Filing Record
exports.createFilingRecord = async (req, res) => {
  try {
    const { client, task: taskId, department, filingPeriod, acknowledgementNumber, remarks } = req.body;

    const fileDoc = req.file ? `/uploads/${req.file.filename}` : null;

    const filing = await FilingRecord.create({
      client,
      task: taskId || null,
      department,
      filingPeriod,
      acknowledgementNumber,
      filingDate: new Date(),
      status: 'Filed',
      filedDocumentUrl: fileDoc,
      remarks,
      filedBy: req.user._id
    });

    // Optionally mark associated task as Completed
    if (taskId) {
      await Task.findByIdAndUpdate(taskId, { status: 'Completed' });
    }

    await logAudit(req.user, 'Filing Completed', `${department} Filing`, `Submitted filing record for period ${filingPeriod} (ACK: ${acknowledgementNumber})`, req);

    res.status(201).json({ message: 'Filing record saved successfully', filing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Filing Records by Department
exports.getFilingRecords = async (req, res) => {
  try {
    const { department, client, filingPeriod, search } = req.query;
    let filter = {};

    if (department) filter.department = department;
    if (client) filter.client = client;
    if (filingPeriod) filter.filingPeriod = filingPeriod;

    if (search) {
      filter.$or = [
        { filingPeriod: { $regex: search, $options: 'i' } },
        { acknowledgementNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const records = await FilingRecord.find(filter)
      .populate('client', 'clientName tradeName pan gstin phone')
      .populate('filedBy', 'name email role')
      .populate('task', 'taskName dueDate priority')
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
