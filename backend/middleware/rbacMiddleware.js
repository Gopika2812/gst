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

      const perm = await Permission.findOne({ role: req.user.role });
      if (!perm) {
        // Default permission fallback
        return next();
      }

      const modulePerm = perm.modules ? perm.modules.get(moduleName) : null;
      if (modulePerm && modulePerm[action] === true) {
        return next();
      }

      // If no explicit permission entry, allow view for non-sensitive pages
      if (action === 'view' && !['User Management', 'Settings'].includes(moduleName)) {
        return next();
      }

      return res.status(403).json({
        message: `Permission denied for action '${action}' on module '${moduleName}'`
      });
    } catch (error) {
      console.error(error);
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
