const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllServices,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

router.route('/')
  .get(protect, getAllServices)
  .post(protect, createService);

router.route('/:id')
  .put(protect, updateService)
  .delete(protect, deleteService);

module.exports = router;
