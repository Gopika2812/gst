const express = require('express');
const router = express.Router();
const { getClientLedger, addLedgerTransaction } = require('../controllers/ledgerController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.get('/client/:clientId', protect, checkPermission('Clients', 'view'), getClientLedger);
router.post('/transaction', protect, checkPermission('Billing', 'create'), addLedgerTransaction);

module.exports = router;
