const express = require('express');
const router = express.Router();
const {
  getClientLedger,
  getAllClientsLedgerSummary,
  addLedgerTransaction,
  updateLedgerTransaction,
  deleteLedgerTransaction
} = require('../controllers/ledgerController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.get('/summary', protect, checkPermission('Clients', 'view'), getAllClientsLedgerSummary);
router.get('/client/:clientId', protect, checkPermission('Clients', 'view'), getClientLedger);
router.post('/transaction', protect, checkPermission('Billing', 'create'), addLedgerTransaction);
router.put('/transaction/:id', protect, checkPermission('Billing', 'edit'), updateLedgerTransaction);
router.delete('/transaction/:id', protect, checkPermission('Billing', 'delete'), deleteLedgerTransaction);

module.exports = router;
