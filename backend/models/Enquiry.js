const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    leadName: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    services: {
      type: [String],
      required: [true, 'At least one service is required'],
      default: []
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['New', 'In Discussion', 'Converted', 'Closed'],
      default: 'New'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    convertedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    convertedClient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    convertedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
