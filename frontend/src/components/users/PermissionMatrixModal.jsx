import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Save } from 'lucide-react';
import api from '../../services/api';

const PermissionMatrixModal = ({ isOpen, onClose }) => {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [modulesState, setModulesState] = useState({
    Dashboard: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
    Clients: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
    Registration: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
    Certification: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
    Billing: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
    'GST Filing': { view: true, create: true, edit: true, delete: false, approve: true, export: true },
    'Book Keeping': { view: true, create: true, edit: true, delete: false, approve: true, export: true },
    'IT Filing': { view: true, create: true, edit: true, delete: false, approve: true, export: true },
    Reports: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
    'Task Board': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
    Settings: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
    'User Management': { view: true, create: true, edit: true, delete: true, approve: true, export: true }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleToggle = (moduleName, action) => {
    setModulesState({
      ...modulesState,
      [moduleName]: {
        ...modulesState[moduleName],
        [action]: !modulesState[moduleName][action]
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      await api.put('/users/permissions', {
        role: selectedRole,
        modules: modulesState
      });
      setMessage(`Permissions successfully saved for role: ${selectedRole}`);
    } catch (err) {
      setMessage('Failed to save permissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#0F2B48]">Page Permission Management (Super Admin)</h3>
            <p className="text-xs text-slate-500">Configure page-wise View, Create, Edit, Delete, Approve, Export access per role</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {message && <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">{message}</div>}

        {/* Role Switcher */}
        <div className="mt-4 flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-700">Select Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-[#0F2B48] outline-none"
          >
            <option>Admin</option>
            <option>Registration Team</option>
            <option>GST Team</option>
            <option>Book Keeping Team</option>
            <option>IT Filing Team</option>
          </select>
        </div>

        {/* Permission Grid Table */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2B48] text-white">
              <tr>
                <th className="p-3 font-semibold">Page / Module</th>
                <th className="p-3 text-center font-semibold">View</th>
                <th className="p-3 text-center font-semibold">Create</th>
                <th className="p-3 text-center font-semibold">Edit</th>
                <th className="p-3 text-center font-semibold">Delete</th>
                <th className="p-3 text-center font-semibold">Approve</th>
                <th className="p-3 text-center font-semibold">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(modulesState).map((mod) => (
                <tr key={mod} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">{mod}</td>
                  {['view', 'create', 'edit', 'delete', 'approve', 'export'].map((act) => (
                    <td key={act} className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={modulesState[mod][act]}
                        onChange={() => handleToggle(mod, act)}
                        className="h-4 w-4 rounded accent-[#52A636] cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-1.5 rounded-xl bg-[#52A636] px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#438A2B]"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Permission Grid'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrixModal;
