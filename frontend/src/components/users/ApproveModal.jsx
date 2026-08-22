import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, User, Mail, Shield, Building2, UserCheck, Sparkles } from 'lucide-react';
import api from '../../services/api';

const ApproveModal = ({ isOpen, onClose, user, onApproved, allUsers = [] }) => {
  const [department, setDepartment] = useState('GST');
  const [role, setRole] = useState('GST Executive');
  const [designation, setDesignation] = useState('');
  const [reportsTo, setReportsTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getRoleOptionsForDept = (dept) => {
    switch (dept) {
      case 'GST':
        return [
          { value: 'GST Executive', label: 'GST Executive' },
          { value: 'GST Admin', label: 'GST Department Admin (Lead)' },
          { value: 'Admin', label: 'Department Admin' }
        ];
      case 'Income Tax':
        return [
          { value: 'Income Tax Executive', label: 'Income Tax Executive' },
          { value: 'Income Tax Admin', label: 'Income Tax Department Admin (Lead)' },
          { value: 'Admin', label: 'Department Admin' }
        ];
      case 'Accounts':
        return [
          { value: 'Accounts Executive', label: 'Accounts Executive' },
          { value: 'Accounts Admin', label: 'Accounts Department Admin (Lead)' },
          { value: 'Admin', label: 'Department Admin' }
        ];
      case 'Registration':
        return [
          { value: 'Registration Executive', label: 'Registration Executive' },
          { value: 'Registration Admin', label: 'Registration Department Admin (Lead)' },
          { value: 'Admin', label: 'Department Admin' }
        ];
      case 'Book Keeping':
        return [
          { value: 'Book Keeping Executive', label: 'Book Keeping Executive' },
          { value: 'Book Keeping Admin', label: 'Book Keeping Department Admin (Lead)' },
          { value: 'Admin', label: 'Department Admin' }
        ];
      case 'Administration':
        return [
          { value: 'Admin', label: 'Administration Manager (Admin)' },
          { value: 'Department Admin', label: 'Department Admin' },
          { value: 'Super Admin', label: 'Super Admin' }
        ];
      default:
        return [
          { value: 'Admin', label: 'Department Admin' },
          { value: 'GST Executive', label: 'Executive' }
        ];
    }
  };

  useEffect(() => {
    if (user) {
      const dept = user.department || 'GST';
      setDepartment(dept);
      setRole(user.role || getRoleOptionsForDept(dept)[0].value);
      setDesignation(user.designation || '');
      setReportsTo(user.reportsTo?._id || user.reportsTo || '');
      setError('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleDeptChange = (newDept) => {
    setDepartment(newDept);
    const roleOpts = getRoleOptionsForDept(newDept);
    setRole(roleOpts[0].value);
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put(`/users/${user._id}/approve`, {
        department,
        role,
        designation,
        reportsTo: reportsTo || null
      });
      onApproved && onApproved(user._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve account');
    } finally {
      setLoading(false);
    }
  };

  const adminUsers = allUsers.filter((u) => u.role && u.role.includes('Admin'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F2B48]">Approve Account & Assign Role</h3>
              <p className="text-xs text-slate-500">Review & set department, role and manager for {user.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleApproveSubmit} className="mt-4 space-y-4">
          {/* User Basic Info Box */}
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800">{user.name}</h4>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                Pending Approval
              </span>
            </div>
            {user.phone && <p className="text-[11px] text-slate-600 mt-1">Phone: {user.phone}</p>}
          </div>

          {/* Department & Role Pickers */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Department *</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-[#52A636]">
                <Building2 className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={department}
                  onChange={(e) => handleDeptChange(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-[#0F2B48] outline-none cursor-pointer"
                >
                  <option value="GST">GST</option>
                  <option value="Income Tax">Income Tax</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Book Keeping">Book Keeping</option>
                  <option value="Registration">Registration</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Role / Access Level *</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-[#52A636]">
                <Shield className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-[#0F2B48] outline-none cursor-pointer"
                >
                  {getRoleOptionsForDept(department).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Designation & Manager */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Designation / Official Title</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-[#52A636]">
                <User className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                  placeholder="e.g. Senior Income Tax Executive"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Reporting Admin Manager</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-[#52A636]">
                <UserCheck className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={reportsTo}
                  onChange={(e) => setReportsTo(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
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

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-xl bg-[#52A636] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#438A2B] transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{loading ? 'Approving...' : 'Approve & Save Access'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApproveModal;
