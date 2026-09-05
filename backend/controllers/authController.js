const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAudit } = require('../middleware/auditLogger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vignesh_associates_auditor_erp_secret_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Register New User (Status = Pending Approval)
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'GST Team',
      department: department || 'GST',
      status: 'Pending Approval'
    });

    await logAudit(user, 'User Registration', 'User Management', `User registered and set to Pending Approval: ${user.email}`, req);

    res.status(201).json({
      message: 'Registration successful! Your account is pending Super Admin / Admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'Pending Approval') {
      return res.status(403).json({ message: 'Account is pending approval from Admin' });
    }

    if (user.status === 'Rejected') {
      return res.status(403).json({ message: 'Account approval was rejected by Admin' });
    }

    if (user.status === 'Deactivated') {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    user.lastLogin = new Date();
    await user.save();

    await logAudit(user, 'User Login', 'Authentication', `User logged in successfully`, req);

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }
    // Simulation reset token message
    res.json({
      message: 'Password reset link sent to registered email address (Simulated).'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.password = newPassword;
    await user.save();
    await logAudit(req.user, 'Reset Password', 'User Management', `Password reset for user: ${user.email}`, req);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Current User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
