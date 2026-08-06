const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  downloadInvoicePDF,
  emailInvoice,
  getWhatsAppShareLink
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.post('/', protect, checkPermission('Billing', 'create'), createInvoice);
router.get('/', protect, checkPermission('Billing', 'view'), getInvoices);
router.get('/:id/pdf', protect, downloadInvoicePDF);
router.post('/:id/email', protect, emailInvoice);
router.get('/:id/whatsapp', protect, getWhatsAppShareLink);

module.exports = router;
