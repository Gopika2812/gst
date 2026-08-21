import React, { useState, useEffect } from 'react';
import { X, Calendar, UserCheck, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TaskModal = ({ isOpen, onClose, onRefresh, clients = [], employees = [], defaultAssignee = null }) => {
  const { user: currentUser } = useAuth();
  const [client, setClient] = useState('');
  const [department, setDepartment] = useState('GST');
  const [taskName, setTaskName] = useState('GSTR3B Filing');
  const [priority, setPriority] = useState('Medium');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderDays, setReminderDays] = useState(3);
  const [repeat, setRepeat] = useState('Monthly');
  const [remarks, setRemarks] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultAssignee) {
      setAssignedEmployee(defaultAssignee._id || defaultAssignee);
      if (defaultAssignee.department && ['GST', 'Book Keeping', 'IT Filing', 'Registration', 'Income Tax', 'Accounts'].includes(defaultAssignee.department)) {
        const deptMap = {
          'Income Tax': 'IT Filing',
          'Accounts': 'Book Keeping'
        };
        setDepartment(deptMap[defaultAssignee.department] || defaultAssignee.department);
      }
    }
  }, [defaultAssignee, isOpen]);

  if (!isOpen) return null;

  const departmentTasksMap = {
    GST: ['GSTR1', 'GSTR3B', 'CMP08', 'GSTR9', 'GSTR9C', 'GST Registration', 'GST Amendment', 'GST Notice Reply'],
    'Book Keeping': ['Monthly Accounting', 'Bank Reconciliation', 'Cash Book', 'Purchase Entry', 'Sales Entry', 'Balance Sheet'],
    'IT Filing': ['IT Return', 'Tax Audit', 'Advance Tax', 'TDS Return', 'Income Tax Notice', '15CA/15CB'],
    Registration: ['Udyam MSME', 'LLP Registration', 'Private Limited', 'Partnership', 'FSSAI License', 'Trade License', 'Shop Act']
  };

  const handleDepartmentChange = (dept) => {
    setDepartment(dept);
    if (departmentTasksMap[dept]) {
      setTaskName(departmentTasksMap[dept][0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client || !assignedEmployee || !dueDate) {
      setError('Please fill in Client, Employee, and Due Date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/tasks', {
        client,
        department,
        taskName,
        priority,
        assignedEmployee,
        dueDate,
        reminderDays,
        repeat,
        remarks
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
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-[#52A636] px-2 py-0.5 text-[10px] font-extrabold text-white uppercase">
                {currentUser?.role === 'Super Admin' ? 'Super Admin Delegation' : 'Admin Task Assignment'}
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
          {/* Department Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600">Department *</label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {['GST', 'Book Keeping', 'IT Filing', 'Registration'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDepartmentChange(d)}
                  className={`rounded-xl py-2 text-xs font-semibold transition ${
                    department === d
                      ? 'bg-[#0F2B48] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Select Client *</label>
              <select
                required
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
              >
                <option value="">-- Select Client --</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.clientName} ({c.gstin || c.pan || 'Active'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Task Template *</label>
              <select
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
              >
                {departmentTasksMap[department]?.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Assigned Employee (Admin or Executive) *</label>
              <select
                required
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
              >
                <option value="">-- Select Assignee --</option>
                <optgroup label="Department Admins & Managers">
                  {employees
                    .filter((e) => e.role === 'Admin')
                    .map((e) => (
                      <option key={e._id} value={e._id}>
                        👑 {e.name} ({e.designation || 'Admin'} - {e.department})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Staff Executives">
                  {employees
                    .filter((e) => e.role !== 'Admin' && e.role !== 'Super Admin')
                    .map((e) => (
                      <option key={e._id} value={e._id}>
                        👤 {e.name} ({e.designation || e.role} - {e.department})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Repeat Frequency</label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
              >
                <option>One Time</option>
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>
          </div>

          {/* Repeat Monthly Notice */}
          {repeat !== 'One Time' && (
            <div className="flex items-start space-x-2 rounded-xl bg-blue-50 p-3 text-blue-800 border border-blue-200">
              <RefreshCw className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
              <p className="text-xs">
                <strong>Automatic Task Creation Enabled:</strong> The system will automatically spawn new task instances every {repeat.toLowerCase()} for this client until deactivated.
              </p>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-600">Remarks / Task Instructions</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Verify sales registers before filing..."
              className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#52A636] px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#438A2B]"
            >
              {loading ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
