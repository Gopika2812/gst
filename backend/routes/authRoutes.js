const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', protect, resetPassword);
router.get('/profile', protect, getProfile);

module.exports = router;
