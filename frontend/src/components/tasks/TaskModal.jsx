import React, { useState, useEffect } from 'react';
import { X, Calendar, UserCheck, AlertCircle, FileText, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TaskModal = ({ isOpen, onClose, onRefresh, employees = [], defaultAssignee = null }) => {
  const { user: currentUser } = useAuth();

  const [taskName, setTaskName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [department, setDepartment] = useState('GST');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultAssignee) {
      setAssignedEmployee(defaultAssignee._id || defaultAssignee);
      if (defaultAssignee.department) {
        setDepartment(defaultAssignee.department);
      }
    }
  }, [defaultAssignee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskName.trim()) {
      setError('Please enter a Task Title');
      return;
    }

    if (!assignedEmployee) {
      setError('Please select an Assigned Person');
      return;
    }

    if (!dueDate) {
      setError('Please select a Deadline date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/tasks', {
        taskType: 'Common Task',
        department,
        taskName,
        priority,
        assignedEmployee,
        dueDate,
        repeat: 'One Time',
        remarks,
        status: 'Assigned'
      });

      // Reset Form State
      setTaskName('');
      setRemarks('');
      setDueDate('');
      setPriority('Medium');

      onRefresh && onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-[#C59B27] px-2 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                {currentUser?.role === 'Super Admin' ? 'Super Admin' : 'Admin'} Task Assignment
              </span>
              <h3 className="text-lg font-bold text-[#0A1E3F]">Assign Task</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned By: <strong className="text-[#0A1E3F]">{currentUser?.name}</strong> ({currentUser?.role})
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* 1. Assigned Department */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-2">
              <Building2 className="h-4 w-4 text-[#C59B27]" />
              <span>Assigned Department *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['GST', 'Income Tax', 'Accounts', 'Administration'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepartment(d)}
                  className={`rounded-xl py-2.5 px-2 text-xs font-bold transition border ${
                    department === d
                      ? 'bg-[#C59B27] text-white border-[#C59B27] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Task Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <FileText className="h-4 w-4 text-[#0A1E3F]" />
              <span>Task Title *</span>
            </label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Monthly GST Return Filing or Audit Review"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#C59B27] focus:bg-white focus:ring-2 focus:ring-[#C59B27]/20"
            />
          </div>

          {/* 3. Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <FileText className="h-4 w-4 text-slate-400" />
              <span>Description / Instructions</span>
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter detailed task description or guidelines for the executive..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none transition focus:border-[#C59B27] focus:bg-white focus:ring-2 focus:ring-[#C59B27]/20"
            />
          </div>

          {/* 4. Assigned Person, 5. Task Priority, 6. Deadline */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Assigned Person */}
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <UserCheck className="h-4 w-4 text-[#0A1E3F]" />
                <span>Assigned Person *</span>
              </label>
              <select
                required
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#C59B27] focus:bg-white"
              >
                <option value="">-- Select Person --</option>
                <optgroup label="Department Admins & Managers">
                  {employees
                    .filter((e) => e.role && e.role.includes('Admin') && e.role !== 'Super Admin')
                    .map((e) => (
                      <option key={e._id} value={e._id}>
                        👑 {e.name} ({e.designation || e.role} - {e.department})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Junior Executives & Staff">
                  {employees
                    .filter((e) => !e.role || !e.role.includes('Admin'))
                    .map((e) => (
                      <option key={e._id} value={e._id}>
                        👤 {e.name} ({e.designation || e.role} - {e.department})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Task Priority */}
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span>Task Priority *</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#C59B27] focus:bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <Calendar className="h-4 w-4 text-rose-500" />
                <span>Deadline *</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#C59B27] focus:bg-white"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#C59B27] px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-[#A68018] disabled:opacity-50"
            >
              {loading ? 'Assigning Task...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
