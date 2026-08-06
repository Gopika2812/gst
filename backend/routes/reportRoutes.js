const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getClientReport,
  getBillingReport,
  getEmployeePerformanceReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.get('/dashboard-summary', protect, getDashboardSummary);
router.get('/clients', protect, checkPermission('Reports', 'view'), getClientReport);
router.get('/billing', protect, checkPermission('Reports', 'view'), getBillingReport);
router.get('/employee-performance', protect, checkPermission('Reports', 'view'), getEmployeePerformanceReport);

module.exports = router;
