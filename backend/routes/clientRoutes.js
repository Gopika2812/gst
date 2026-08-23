const express = require('express');
const router = express.Router();
const {
  createClient,
  lookupByPhone,
  getClients,
  getClientById,
  updateClient,
  toggleClientStatus
} = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');
const upload = require('../middleware/uploadMiddleware');

const clientFields = [
  { name: 'panDoc', maxCount: 1 },
  { name: 'gstDoc', maxCount: 1 },
  { name: 'aadhaarDoc', maxCount: 1 },
  { name: 'certificateDoc', maxCount: 1 }
];

router.get('/lookup-phone/:phone', protect, checkPermission('Clients', 'view'), lookupByPhone);
router.post('/', protect, checkPermission('Clients', 'create'), upload.fields(clientFields), createClient);
router.get('/', protect, checkPermission('Clients', 'view'), getClients);
router.get('/:id', protect, checkPermission('Clients', 'view'), getClientById);
router.put('/:id', protect, checkPermission('Clients', 'edit'), upload.fields(clientFields), updateClient);
router.put('/:id/toggle-status', protect, checkPermission('Clients', 'edit'), toggleClientStatus);

module.exports = router;
