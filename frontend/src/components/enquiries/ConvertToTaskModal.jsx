import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRightCircle,
  Building2,
  UserCheck,
  Calendar,
  AlertCircle,
  FileText,
  CheckCircle2,
  Tag
} from 'lucide-react';
import api from '../../services/api';

const ConvertToTaskModal = ({ isOpen, onClose, enquiry, employees = [], onSuccess }) => {
  const [taskName, setTaskName] = useState('');
  const [department, setDepartment] = useState('GST');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (enquiry) {
      // Determine smart department from enquiry services
      const srvList = enquiry.services || [];
      const srvStr = srvList.join(', ');
      let smartDept = 'GST';

      if (srvList.some((s) => s.toLowerCase().includes('tax') || s.toLowerCase().includes('itr'))) {
        smartDept = 'Income Tax';
      } else if (srvList.some((s) => s.toLowerCase().includes('book') || s.toLowerCase().includes('account'))) {
        smartDept = 'Accounts';
      } else if (srvList.some((s) => s.toLowerCase().includes('registration') || s.toLowerCase().includes('roc') || s.toLowerCase().includes('audit'))) {
        smartDept = 'Administration';
      }

      setDepartment(smartDept);
      setTaskName(`Enquiry Action: ${enquiry.leadName}${srvStr ? ` (${srvStr})` : ''}`);
      setPriority(enquiry.priority || 'Medium');

      // Default due date: +2 days
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      setDueDate(targetDate.toISOString().split('T')[0]);

      setAssignedEmployee(enquiry.assignedTo?._id || enquiry.assignedTo || '');
      setRemarks(enquiry.notes ? `Lead Inquiry Notes: ${enquiry.notes}` : '');
    }
    setError('');
  }, [enquiry, isOpen]);

  if (!isOpen || !enquiry) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskName.trim()) {
      setError('Please provide a Task Title');
      return;
    }
    if (!assignedEmployee) {
      setError('Please select an Assigned Person for this task');
      return;
    }
    if (!dueDate) {
      setError('Please select a Deadline date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/enquiries/${enquiry._id}/convert-to-task`, {
        taskName: taskName.trim(),
        department,
        assignedEmployee,
        priority,
        dueDate,
        remarks: remarks.trim()
      });

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Error converting enquiry to task:', err);
      setError(err.response?.data?.message || 'Failed to convert enquiry to task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#52A636] text-white shadow-md shadow-[#52A636]/30">
              <ArrowRightCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0A1E3F]">Convert Enquiry to Task</h3>
              <p className="text-xs text-slate-500">
                Spawns a new actionable task on the Task Board and links it to this lead
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lead Context Summary Box */}
        <div className="mt-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-3.5 text-xs text-slate-700 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[#0A1E3F] text-sm">{enquiry.leadName}</span>
            <span className="font-bold text-[#52A636] bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
              {enquiry.phone}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {enquiry.services?.map((srv) => (
              <span
                key={srv}
                className="rounded-md bg-emerald-600/10 text-emerald-800 font-semibold px-2 py-0.5 text-[11px]"
              >
                {srv}
              </span>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-200 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Department Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-2">
              <Building2 className="h-4 w-4 text-[#52A636]" />
              <span>Target Department *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['GST', 'Income Tax', 'Accounts', 'Administration'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepartment(d)}
                  className={`rounded-xl py-2 px-2 text-xs font-bold transition border cursor-pointer ${
                    department === d
                      ? 'bg-[#52A636] text-white border-[#52A636] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <FileText className="h-4 w-4 text-[#0A1E3F]" />
              <span>Task Name / Title *</span>
            </label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Enquiry Follow-up & GST Quotation"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white focus:ring-2 focus:ring-[#52A636]/20"
            />
          </div>

          {/* Assignee, Priority, Deadline */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <UserCheck className="h-4 w-4 text-[#0A1E3F]" />
                <span>Assigned Staff *</span>
              </label>
              <select
                required
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white"
              >
                <option value="">-- Select Person --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.role} - {emp.department || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span>Priority *</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

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
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white"
              />
            </div>
          </div>

          {/* Description & Action Plan */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <FileText className="h-4 w-4 text-slate-400" />
              <span>Instructions / Action Notes</span>
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Instructions for the assigned staff member regarding this lead..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white focus:ring-2 focus:ring-[#52A636]/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#52A636] px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-[#438A2B] disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{loading ? 'Converting...' : 'Convert & Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertToTaskModal;
