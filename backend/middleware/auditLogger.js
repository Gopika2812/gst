const AuditLog = require('../models/AuditLog');

const logAudit = async (user, action, moduleName, details = '', req = null) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
    await AuditLog.create({
      user: user ? user._id : null,
      userName: user ? user.name : 'System/Guest',
      userRole: user ? user.role : 'System',
      action,
      module: moduleName,
      details,
      ipAddress
    });
  } catch (err) {
    console.error('Audit Log recording error:', err.message);
  }
};

module.exports = { logAudit };
