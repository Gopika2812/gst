import React, { useState, useEffect } from 'react';
import { X, Calendar, UserCheck, AlertCircle, RefreshCw, ShieldCheck, FileText, Building2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TaskModal = ({ isOpen, onClose, onRefresh, clients = [], employees = [], defaultAssignee = null }) => {
  const { user: currentUser } = useAuth();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [taskType, setTaskType] = useState('Common Task');
  const [client, setClient] = useState('');
  const [department, setDepartment] = useState('GST');
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeat, setRepeat] = useState('One Time');
  const [remarks, setRemarks] = useState('');

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

  const departmentTasksMap = {
    GST: ['GSTR1 Filing', 'GSTR3B Filing', 'CMP08 Filing', 'GSTR9 Annual Return', 'GST Registration', 'GST Notice Reply'],
    'Income Tax': ['IT Return Filing', 'Tax Audit Report', 'Advance Tax Calculation', 'TDS Return Filing', 'Income Tax Notice Response'],
    'IT Filing': ['IT Return Filing', 'Tax Audit Report', 'Advance Tax Calculation', 'TDS Return Filing'],
    Accounts: ['Monthly Bookkeeping', 'Bank Reconciliation', 'Financial Statements', 'P&L Statement', 'Cashflow Statement'],
    'Book Keeping': ['Monthly Accounting', 'Bank Reconciliation', 'Cash Book Entry', 'Ledger Audit'],
    Registration: ['Udyam MSME Registration', 'Private Limited Inc', 'LLP Registration', 'FSSAI License', 'Shop Act'],
    Administration: ['Internal Firm Audit', 'Staff Performance Review', 'Software Credentials Audit', 'Department Compliance Check']
  };

  const handleDepartmentChange = (dept) => {
    setDepartment(dept);
    if (departmentTasksMap[dept] && (!taskName || departmentTasksMap[department]?.includes(taskName))) {
      setTaskName(departmentTasksMap[dept][0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskName.trim()) {
      setError('Please enter a Task Title');
      return;
    }

    if (taskType === 'Client Task' && !client) {
      setError('Please select a Client for Client-specific tasks');
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
        taskType,
        client: taskType === 'Client Task' ? client : null,
        department,
        taskName,
        priority,
        assignedEmployee,
        dueDate,
        repeat,
        remarks,
        status: 'Assigned'
      });

      onRefresh && onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-[#52A636] px-2 py-0.5 text-[10px] font-extrabold text-white uppercase">
                {currentUser?.role === 'Super Admin' ? 'Super Admin Task Creation' : 'Admin Task Assignment'}
              </span>
              <h3 className="text-lg font-bold text-[#0F2B48]">Assign Task</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned By: <strong className="text-[#0F2B48]">{currentUser?.name}</strong> ({currentUser?.role})
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-200">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* TASK TYPE TOGGLE */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Task Category Type *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTaskType('Common Task')}
                className={`flex items-center justify-center space-x-2 rounded-xl py-2.5 px-3 text-xs font-bold transition border ${
                  taskType === 'Common Task'
                    ? 'bg-[#0F2B48] text-white border-[#0F2B48] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className="h-4 w-4 text-[#52A636]" />
                <span>Common Department Task</span>
              </button>
              <button
                type="button"
                onClick={() => setTaskType('Client Task')}
                className={`flex items-center justify-center space-x-2 rounded-xl py-2.5 px-3 text-xs font-bold transition border ${
                  taskType === 'Client Task'
                    ? 'bg-[#0F2B48] text-white border-[#0F2B48] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <User className="h-4 w-4 text-blue-400" />
                <span>Existing Client Task</span>
              </button>
            </div>
          </div>

          {/* Department Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Department *</label>
            <div className="mt-1.5 grid grid-cols-3 sm:grid-cols-6 gap-2">
              {['GST', 'Income Tax', 'Accounts', 'Administration'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDepartmentChange(d)}
                  className={`rounded-xl py-2 px-1 text-[11px] font-extrabold transition ${
                    department === d
                      ? 'bg-[#52A636] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Client Selector if Client Task */}
          {taskType === 'Client Task' && (
            <div>
              <label className="text-xs font-semibold text-slate-700">Select Existing Client *</label>
              <select
                required
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#52A636]"
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.clientName} ({c.gstin || c.pan || 'Active Client'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Title & Auto Created Date */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Task Title / Name *</label>
              <input
                type="text"
                required
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g. Monthly GSTR3B Filing or Software Audit"
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-medium text-slate-800 outline-none focus:border-[#52A636]"
              />
              {departmentTasksMap[department] && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Templates:</span>
                  {departmentTasksMap[department].slice(0, 3).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTaskName(t)}
                      className="text-[10px] font-semibold text-[#0F2B48] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Created Date (Auto)</label>
              <input
                type="date"
                disabled
                value={todayStr}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 p-2 text-xs font-medium text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Assigned Person & Priority & Deadline */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Assigned Person *</label>
              <select
                required
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-medium text-slate-800 outline-none focus:border-[#52A636]"
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

            <div>
              <label className="text-xs font-semibold text-slate-700">Task Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-medium text-slate-800 outline-none focus:border-[#52A636]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Deadline (Due Date) *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-medium text-slate-800 outline-none focus:border-[#52A636]"
              />
            </div>
          </div>

          {/* Repeat Frequency */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Repeat Frequency</label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className="mt-1 w-full sm:w-1/2 rounded-xl border border-slate-200 p-2 text-xs font-medium text-slate-800 outline-none focus:border-[#52A636]"
            >
              <option value="One Time">One Time</option>
              <option value="Monthly">Monthly Recurring</option>
              <option value="Quarterly">Quarterly Recurring</option>
              <option value="Yearly">Yearly Recurring</option>
            </select>
          </div>

          {/* Task Description */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Task Description / Instructions</label>
            <textarea
              rows={2.5}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Detailed task description or specific guidelines for the executive..."
              className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-3">
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
              className="rounded-xl bg-[#52A636] px-5 py-2 text-xs font-extrabold text-white shadow-md transition hover:bg-[#438A2B]"
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
