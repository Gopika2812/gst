const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      enum: [
        'Super Admin',
        'Admin',
        'Registration Team',
        'GST Team',
        'Book Keeping Team',
        'IT Filing Team'
      ]
    },
    modules: {
      type: Map,
      of: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        export: { type: Boolean, default: false }
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Permission', permissionSchema);
