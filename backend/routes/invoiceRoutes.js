const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePDF,
  emailInvoice,
  getWhatsAppShareLink,
  assignTaskFromInvoice
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.post('/', protect, checkPermission('Billing', 'create'), createInvoice);
router.get('/', protect, checkPermission('Billing', 'view'), getInvoices);
router.put('/:id', protect, checkPermission('Billing', 'edit'), updateInvoice);
router.delete('/:id', protect, checkPermission('Billing', 'delete'), deleteInvoice);
router.post('/:id/assign-task', protect, checkPermission('Billing', 'edit'), assignTaskFromInvoice);
router.get('/:id/pdf', protect, downloadInvoicePDF);
router.post('/:id/email', protect, emailInvoice);
router.get('/:id/whatsapp', protect, getWhatsAppShareLink);

module.exports = router;
