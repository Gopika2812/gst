const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(enquiryController.getEnquiries)
  .post(enquiryController.createEnquiry);

router.route('/:id')
  .get(enquiryController.getEnquiryById)
  .put(enquiryController.updateEnquiry)
  .delete(enquiryController.deleteEnquiry);

router.post('/:id/convert-to-task', enquiryController.convertToTask);

module.exports = router;
