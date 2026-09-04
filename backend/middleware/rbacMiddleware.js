const Permission = require('../models/Permission');

const checkPermission = (moduleName, action = 'view') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User unauthenticated' });
      }

      // Super Admin bypasses all module permission checks
      if (req.user.role === 'Super Admin') {
        return next();
      }

      // 1. Check for User-Specific permission override first
      let perm = await Permission.findOne({ targetType: 'user', user: req.user._id });

      // 2. If no user-specific override, fallback to Role-level permission
      if (!perm) {
        perm = await Permission.findOne({ $or: [{ targetType: 'role', role: req.user.role }, { role: req.user.role }] });
      }

      if (!perm) {
        // Default permission fallback: allow view for non-sensitive pages
        if (action === 'view' && !['User Management', 'Settings', 'Audit Logs'].includes(moduleName)) {
          return next();
        }
        return res.status(403).json({
          message: `Permission denied for action '${action}' on module '${moduleName}'`
        });
      }

      let modulePerm = null;
      if (perm.modules) {
        if (typeof perm.modules.get === 'function') {
          modulePerm = perm.modules.get(moduleName);
        } else {
          modulePerm = perm.modules[moduleName];
        }
      }

      if (modulePerm && modulePerm[action] === true) {
        return next();
      }

      // If no explicit module configuration exists, allow view for non-sensitive pages
      if (action === 'view' && !['User Management', 'Settings', 'Audit Logs'].includes(moduleName) && (!modulePerm || modulePerm[action] !== false)) {
        return next();
      }

      return res.status(403).json({
        message: `Permission denied for action '${action}' on module '${moduleName}'`
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ message: 'Permission check error' });
    }
  };
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Super Admin') {
    return next();
  }
  return res.status(403).json({ message: 'Action requires Super Admin privilege' });
};

module.exports = { checkPermission, requireSuperAdmin };
