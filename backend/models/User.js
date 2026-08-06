const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        'Super Admin',
        'Admin',
        'Registration Team',
        'GST Team',
        'Book Keeping Team',
        'IT Filing Team'
      ],
      default: 'GST Team'
    },
    status: {
      type: String,
      enum: ['Pending Approval', 'Approved', 'Rejected', 'Deactivated'],
      default: 'Pending Approval'
    },
    department: {
      type: String,
      enum: ['GST', 'Book Keeping', 'IT Filing', 'Registration', 'Management'],
      default: 'GST'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
