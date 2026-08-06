const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, checkPermission('Task Board', 'create'), upload.single('attachment'), createTask);
router.get('/', protect, checkPermission('Task Board', 'view'), getTasks);
router.put('/:id/status', protect, upload.single('attachment'), updateTaskStatus);
router.delete('/:id', protect, checkPermission('Task Board', 'delete'), deleteTask);

module.exports = router;
