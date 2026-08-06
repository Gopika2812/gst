const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const { module: moduleName, userRole, search } = req.query;
    let filter = {};

    if (moduleName) filter.module = moduleName;
    if (userRole) filter.userRole = userRole;

    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ];
    }

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .limit(200);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
