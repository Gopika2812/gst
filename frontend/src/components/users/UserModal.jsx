import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Lock, Shield, Building2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

const UserModal = ({ isOpen, onClose, user, onSave, allUsers = [] }) => {
  const isEdit = Boolean(user && user._id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'GST Executive',
    department: 'GST',
    designation: '',
    reportsTo: '',
    status: 'Approved',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'GST Executive',
        department: user.department || 'GST',
        designation: user.designation || '',
        reportsTo: user.reportsTo?._id || user.reportsTo || '',
        status: user.status || 'Approved',
        password: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'GST Executive',
        department: 'GST',
        designation: '',
        reportsTo: '',
        status: 'Approved',
        password: ''
      });
    }
    setError('');
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/users/${user._id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user account details');
    } finally {
      setLoading(false);
    }
  };

  const adminUsers = allUsers.filter((u) => ['Super Admin', 'Admin'].includes(u.role));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F2B48]">
              {isEdit ? 'Edit User Profile & Settings' : 'Create New Staff Account'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEdit ? `Update role, status & details for ${user?.name}` : 'Add a new member to the Auditor ERP Portal'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Full Name *</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:border-[#52A636]">
                <User className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                  placeholder="Vigneshwaran CA"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Email Address *</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:border-[#52A636]">
                <Mail className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                  placeholder="user@vigneshassociates.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:border-[#52A636]">
                <Phone className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                {isEdit ? 'Reset Password (Optional)' : 'Password *'}
              </label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:border-[#52A636]">
                <Lock className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!isEdit}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                  placeholder={isEdit ? 'Leave blank to keep unchanged' : 'Enter account password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Role *</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:border-[#52A636]">
                <Shield className="mr-2 h-4 w-4 text-slate-400" />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin (Dept Lead)</option>
                  <option value="Department Admin">Department Admin</option>
                  <option value="GST Admin">GST Admin (Department Lead)</option>
                  <option value="Income Tax Admin">Income Tax Admin (Department Lead)</option>
                  <option value="Accounts Admin">Accounts Admin (Department Lead)</option>
                  <option value="Registration Admin">Registration Admin (Department Lead)</option>
                  <option value="Book Keeping Admin">Book Keeping Admin (Department Lead)</option>
                  <option value="GST Executive">GST Executive</option>
                  <option value="Income Tax Executive">Income Tax Executive</option>
                  <option value="Accounts Executive">Accounts Executive</option>
                  <option value="Registration Executive">Registration Executive</option>
                  <option value="Book Keeping Executive">Book Keeping Executive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Department *</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:border-[#52A636]">
                <Building2 className="mr-2 h-4 w-4 text-slate-400" />
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                >
                  <option value="Management">Management</option>
                  <option value="Administration">Administration</option>
                  <option value="GST">GST</option>
                  <option value="Income Tax">Income Tax</option>
                  <option value="Accounts">Accounts</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Designation / Title</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:border-[#52A636]">
                <User className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                  placeholder="e.g. Senior Income Tax Executive"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Reports To (Admin Lead)</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:border-[#52A636]">
                <User className="mr-2 h-4 w-4 text-slate-400" />
                <select
                  value={formData.reportsTo}
                  onChange={(e) => setFormData({ ...formData, reportsTo: e.target.value })}
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                >
                  <option value="">-- No Direct Admin --</option>
                  {adminUsers.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.designation || a.role} - {a.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Account Status *</label>
            <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:border-[#52A636]">
              <CheckCircle className="mr-2 h-4 w-4 text-slate-400" />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-transparent text-xs text-slate-800 outline-none"
              >
                <option value="Approved">Approved</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Rejected">Rejected</option>
                <option value="Deactivated">Deactivated</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#52A636] px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#438A2B] transition"
            >
              {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
