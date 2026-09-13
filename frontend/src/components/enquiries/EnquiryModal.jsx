import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  X,
  User,
  Phone,
  Mail,
  CheckSquare,
  Square,
  Sparkles,
  AlertCircle,
  FileText,
  UserCheck,
  Plus,
  Tag
} from 'lucide-react';
import api from '../../services/api';

const PRESET_SERVICES = [
  'GST Filing & Returns',
  'Income Tax (ITR) Filing',
  'Accounts & Bookkeeping',
  'Company Registration',
  'Audit & Certification',
  'TDS & TCS Returns',
  'ROC Compliance',
  'Trademark & IP',
  'Payroll & Labor Laws',
  'Business Consultation'
];

const EnquiryModal = ({ isOpen, onClose, onSuccess, enquiry = null, employees = [] }) => {
  const [leadName, setLeadName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('New');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(enquiry && enquiry._id);

  useEffect(() => {
    if (enquiry) {
      setLeadName(enquiry.leadName || '');
      setPhone(enquiry.phone || '');
      setEmail(enquiry.email || '');
      setSelectedServices(enquiry.services || []);
      setPriority(enquiry.priority || 'Medium');
      setStatus(enquiry.status || 'New');
      setNotes(enquiry.notes || '');
      setAssignedTo(enquiry.assignedTo?._id || enquiry.assignedTo || '');
    } else {
      setLeadName('');
      setPhone('');
      setEmail('');
      setSelectedServices([]);
      setPriority('Medium');
      setStatus('New');
      setNotes('');
      setAssignedTo('');
    }
    setError('');
  }, [enquiry, isOpen]);

  if (!isOpen) return null;

  const toggleService = (service) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.filter((s) => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleAddCustomService = (e) => {
    e.preventDefault();
    const trimmed = customServiceInput.trim();
    if (!trimmed) return;
    if (!selectedServices.includes(trimmed)) {
      setSelectedServices((prev) => [...prev, trimmed]);
    }
    setCustomServiceInput('');
  };

  const removeService = (service) => {
    setSelectedServices((prev) => prev.filter((s) => s !== service));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!leadName.trim()) {
      setError('Please enter the Lead Name');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a valid Phone Number');
      return;
    }
    if (selectedServices.length === 0) {
      setError('Please select at least one service requested by the lead');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        leadName: leadName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        services: selectedServices,
        priority,
        status,
        notes: notes.trim(),
        assignedTo: assignedTo || null
      };

      if (isEditing) {
        await api.put(`/enquiries/${enquiry._id}`, payload);
      } else {
        await api.post('/enquiries', payload);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving enquiry:', err);
      setError(err.response?.data?.message || 'Failed to save enquiry');
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#52A636]/10 text-[#52A636]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0A1E3F]">
                {isEditing ? 'Edit Lead Enquiry' : 'Create New Enquiry'}
              </h3>
              <p className="text-xs text-slate-500">
                Capture prospective client lead details and requested service offerings
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

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-200 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          
          {/* Row 1: Lead Name & Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <User className="h-3.5 w-3.5 text-[#0A1E3F]" />
                <span>Lead Name *</span>
              </label>
              <input
                type="text"
                required
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="e.g. Ramesh Kumar or Apex Trading Co."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white focus:ring-2 focus:ring-[#52A636]/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <Phone className="h-3.5 w-3.5 text-[#52A636]" />
                <span>Phone Number *</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white focus:ring-2 focus:ring-[#52A636]/20"
              />
            </div>
          </div>

          {/* Row 2: Email & Priority */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>Email Address (Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. contact@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white focus:ring-2 focus:ring-[#52A636]/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                <span>Priority / Urgency *</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white"
              >
                <option value="Low">Low - Casual Inquiry</option>
                <option value="Medium">Medium - Regular Lead</option>
                <option value="High">High - Urgent / Immediate</option>
                <option value="Critical">Critical - High-Value Prospect</option>
              </select>
            </div>
          </div>

          {/* Row 3: Services (Multiple Choice Selection) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold text-[#0A1E3F] flex items-center space-x-1.5">
                <Tag className="h-4 w-4 text-[#52A636]" />
                <span>Services Requested (Multiple Choice) *</span>
              </label>
              <span className="text-[11px] font-semibold text-[#52A636] bg-[#52A636]/10 px-2 py-0.5 rounded-full">
                {selectedServices.length} Selected
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Select one or multiple services the client is inquiring about:
            </p>

            {/* Quick Multi-Select Service Pills */}
            <div className="flex flex-wrap gap-2">
              {PRESET_SERVICES.map((srv) => {
                const isSelected = selectedServices.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => toggleService(srv)}
                    className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#52A636] text-white border-[#52A636] shadow-sm shadow-[#52A636]/30'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-3.5 w-3.5 shrink-0 text-white" />
                    ) : (
                      <Square className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    )}
                    <span>{srv}</span>
                  </button>
                );
              })}
            </div>

            {/* Add Custom / Other Service */}
            <div className="mt-3.5 pt-3 border-t border-slate-200/80 flex items-center space-x-2">
              <input
                type="text"
                value={customServiceInput}
                onChange={(e) => setCustomServiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomService(e);
                  }
                }}
                placeholder="Other specific service (type & press Add)..."
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#52A636]"
              />
              <button
                type="button"
                onClick={handleAddCustomService}
                className="flex items-center space-x-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-900 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Custom</span>
              </button>
            </div>

            {/* Custom added pills if any */}
            {selectedServices.some((s) => !PRESET_SERVICES.includes(s)) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedServices
                  .filter((s) => !PRESET_SERVICES.includes(s))
                  .map((customSrv) => (
                    <span
                      key={customSrv}
                      className="inline-flex items-center space-x-1 rounded-lg bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-semibold"
                    >
                      <span>{customSrv}</span>
                      <button
                        type="button"
                        onClick={() => removeService(customSrv)}
                        className="text-emerald-900 hover:text-rose-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Row 4: Status & Assigned Staff */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>Enquiry Status</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white"
              >
                <option value="New">New (Uncontacted)</option>
                <option value="In Discussion">In Discussion / Follow-up</option>
                <option value="Converted">Converted to Client / Task</option>
                <option value="Closed">Closed / Not Interested</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <UserCheck className="h-3.5 w-3.5 text-[#0A1E3F]" />
                <span>Assigned Executive (Optional)</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white"
              >
                <option value="">-- Unassigned (General Pool) --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.role} - {emp.department || 'General'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Notes / Conversation Remarks */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Notes & Discussion Details</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs GST registration for a new retail business in Chennai. Budget discussed, requested quotation..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white focus:ring-2 focus:ring-[#52A636]/20"
            />
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4 mt-6">
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
              <Sparkles className="h-4 w-4" />
              <span>{loading ? 'Saving...' : isEditing ? 'Update Enquiry' : 'Save Enquiry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EnquiryModal;
