const express = require('express');
const router = express.Router();
const {
  getUsers,
  approveUser,
  rejectUser,
  toggleUserStatus,
  updateUserRole,
  getPermissions,
  updatePermissions
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission, requireSuperAdmin } = require('../middleware/rbacMiddleware');

router.get('/', protect, checkPermission('User Management', 'view'), getUsers);
router.put('/:id/approve', protect, checkPermission('User Management', 'approve'), approveUser);
router.put('/:id/reject', protect, checkPermission('User Management', 'approve'), rejectUser);
router.put('/:id/toggle-status', protect, checkPermission('User Management', 'edit'), toggleUserStatus);
router.put('/:id/role', protect, checkPermission('User Management', 'edit'), updateUserRole);

router.get('/permissions', protect, getPermissions);
router.put('/permissions', protect, requireSuperAdmin, updatePermissions);

module.exports = router;
