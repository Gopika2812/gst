import React, { useState, useEffect } from 'react';
import { X, Calendar, UserCheck, AlertCircle, FileText, Building2, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TaskModal = ({ isOpen, onClose, onRefresh, employees = [], clients = [], defaultAssignee = null }) => {
  const { user: currentUser } = useAuth();

  const [taskName, setTaskName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [department, setDepartment] = useState('GST');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  const [localEmployees, setLocalEmployees] = useState(employees);
  const [localClients, setLocalClients] = useState(clients);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employees && employees.length > 0) {
      setLocalEmployees(employees);
    } else if (isOpen) {
      api.get('/users').then((res) => setLocalEmployees(res.data || [])).catch(console.error);
    }
  }, [isOpen, employees]);

  useEffect(() => {
    if (clients && clients.length > 0) {
      setLocalClients(clients);
    } else if (isOpen) {
      api.get('/clients').then((res) => setLocalClients(res.data || [])).catch(console.error);
    }
  }, [isOpen, clients]);

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
        client: selectedClient || null,
        taskType: selectedClient ? 'Client Task' : 'Common Task',
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
      setSelectedClient('');
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

  const currentClientObj = localClients.find((c) => c._id === selectedClient);

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

          {/* 2. Registered Client Selection (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <User className="h-4 w-4 text-[#0A1E3F]" />
                <span>Select Registered Client (Optional)</span>
              </label>
              {selectedClient && (
                <button
                  type="button"
                  onClick={() => setSelectedClient('')}
                  className="text-[11px] font-semibold text-rose-500 hover:underline"
                >
                  Clear Selection
                </button>
              )}
            </div>
            <select
              value={selectedClient}
              onChange={(e) => {
                const cId = e.target.value;
                setSelectedClient(cId);
                const found = localClients.find((c) => c._id === cId);
                if (found && !taskName) {
                  setTaskName(`${department} Service - ${found.clientName}`);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#C59B27] focus:bg-white"
            >
              <option value="">-- No Client (Internal General Task) --</option>
              {localClients
                .filter((c) => c.status === 'Active' || !c.status)
                .map((client) => (
                  <option key={client._id} value={client._id}>
                    🏢 {client.clientName} {client.tradeName ? `(${client.tradeName})` : ''} {client.phone ? `• 📞 ${client.phone}` : ''}
                  </option>
                ))}
            </select>
            {currentClientObj && (
              <div className="mt-2 flex items-center justify-between rounded-xl bg-amber-50/60 p-2.5 border border-amber-200/60 text-xs">
                <div className="flex items-center space-x-2 text-[#0A1E3F]">
                  <CheckCircle2 className="h-4 w-4 text-[#C59B27] shrink-0" />
                  <span className="font-semibold">Linked Client: <strong>{currentClientObj.clientName}</strong></span>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  Client Task
                </span>
              </div>
            )}
          </div>

          {/* 3. Task Title */}
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

          {/* 4. Description */}
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

          {/* 5. Assigned Person, Task Priority, Deadline */}
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
                  {localEmployees
                    .filter((e) => e.role && e.role.includes('Admin') && e.role !== 'Super Admin')
                    .map((e) => (
                      <option key={e._id} value={e._id}>
                        👑 {e.name} ({e.designation || e.role} - {e.department})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Junior Executives & Staff">
                  {localEmployees
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
