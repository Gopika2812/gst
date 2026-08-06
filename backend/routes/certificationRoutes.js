const express = require('express');
const router = express.Router();
const {
  createCertification,
  getCertifications,
  updateCertification
} = require('../controllers/certificationController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, checkPermission('Certification', 'create'), createCertification);
router.get('/', protect, checkPermission('Certification', 'view'), getCertifications);
router.put('/:id', protect, checkPermission('Certification', 'edit'), upload.single('uploadedCertificate'), updateCertification);

module.exports = router;
