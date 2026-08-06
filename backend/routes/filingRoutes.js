const express = require('express');
const router = express.Router();
const { createFilingRecord, getFilingRecords } = require('../controllers/filingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.single('filedDocument'), createFilingRecord);
router.get('/', protect, getFilingRecords);

module.exports = router;
