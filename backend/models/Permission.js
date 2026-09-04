const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['role', 'user'],
      default: 'role'
    },
    role: {
      type: String,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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

// Compound index to ensure uniqueness per role or per user
permissionSchema.index({ targetType: 1, role: 1 }, { unique: true, partialFilterExpression: { role: { $type: 'string' } } });
permissionSchema.index({ targetType: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $exists: true } } });

module.exports = mongoose.model('Permission', permissionSchema);
