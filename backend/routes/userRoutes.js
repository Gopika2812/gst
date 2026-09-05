const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  approveUser,
  rejectUser,
  toggleUserStatus,
  updateUserRole,
  getPermissions,
  updatePermissions,
  resetUserPermissions
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission, requireSuperAdmin } = require('../middleware/rbacMiddleware');

// Specific routes first to avoid :id param collision
router.get('/permissions', protect, getPermissions);
router.put('/permissions', protect, requireSuperAdmin, updatePermissions);
router.delete('/permissions/user/:userId', protect, requireSuperAdmin, resetUserPermissions);

router.get('/', protect, checkPermission('User Management', 'view'), getUsers);
router.post('/', protect, checkPermission('User Management', 'create'), createUser);
router.put('/:id', protect, checkPermission('User Management', 'edit'), updateUser);
router.delete('/:id', protect, checkPermission('User Management', 'delete'), deleteUser);

router.put('/:id/approve', protect, checkPermission('User Management', 'approve'), approveUser);
router.put('/:id/reject', protect, checkPermission('User Management', 'approve'), rejectUser);
router.put('/:id/toggle-status', protect, checkPermission('User Management', 'edit'), toggleUserStatus);
router.put('/:id/role', protect, checkPermission('User Management', 'edit'), updateUserRole);

module.exports = router;
