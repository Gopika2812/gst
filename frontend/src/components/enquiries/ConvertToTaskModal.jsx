import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  X,
  ArrowRightCircle,
  Building2,
  UserCheck,
  Calendar,
  AlertCircle,
  FileText,
  CheckCircle2,
  UserPlus,
  Users,
  Search,
  Check,
  Building,
  CreditCard,
  MapPin,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';

const ConvertToTaskModal = ({ isOpen, onClose, enquiry, employees = [], onSuccess }) => {
  // Client Registration Option: 'register' | 'existing' | 'none'
  const [clientOption, setClientOption] = useState('register');
  const [existingClients, setExistingClients] = useState([]);
  const [selectedExistingClient, setSelectedExistingClient] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef(null);

  // Shortcut Client Registration Fields
  const [clientFormData, setClientFormData] = useState({
    clientName: '',
    tradeName: '',
    phone: '',
    email: '',
    clientType: 'Proprietorship',
    pan: '',
    gstin: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: '',
    pincode: ''
  });

  // Task Details Fields
  const [taskName, setTaskName] = useState('');
  const [department, setDepartment] = useState('GST');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load existing clients for linking option
  useEffect(() => {
    if (isOpen) {
      api.get('/clients')
        .then((res) => setExistingClients(res.data || []))
        .catch((err) => console.warn('Could not load clients:', err));
    }
  }, [isOpen]);

  // Click outside to close client dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      // Initialize Client Form Shortcut with enquiry values
      setClientFormData({
        clientName: enquiry.leadName || '',
        tradeName: '',
        phone: enquiry.phone || '',
        email: enquiry.email || '',
        clientType: 'Proprietorship',
        pan: '',
        gstin: '',
        city: 'Chennai',
        state: 'Tamil Nadu',
        address: '',
        pincode: ''
      });

      setClientOption('register');
      setSelectedExistingClient('');
      setClientSearchQuery('');
    }
    setError('');
  }, [enquiry, isOpen]);

  if (!isOpen || !enquiry) return null;

  const handleClientFieldChange = (field, value) => {
    setClientFormData((prev) => ({ ...prev, [field]: value }));
  };

  const filteredExistingClients = existingClients.filter((c) => {
    const q = clientSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.clientName && c.clientName.toLowerCase().includes(q)) ||
      (c.tradeName && c.tradeName.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.clientCode && c.clientCode.toLowerCase().includes(q))
    );
  });

  const currentSelectedClientObj = existingClients.find((c) => c._id === selectedExistingClient);

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

    if (clientOption === 'register') {
      if (!clientFormData.clientName.trim()) {
        setError('Please enter the Client Name for registration');
        return;
      }
      if (!clientFormData.phone.trim()) {
        setError('Please enter the Client Phone Number');
        return;
      }
    }

    if (clientOption === 'existing' && !selectedExistingClient) {
      setError('Please select an existing client or switch to Register New Client');
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
        remarks: remarks.trim(),
        registerClient: clientOption === 'register',
        clientData: clientOption === 'register' ? clientFormData : null,
        clientId: clientOption === 'existing' ? selectedExistingClient : null
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

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-100 max-h-[94vh] overflow-y-auto my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#52A636] text-white shadow-md shadow-[#52A636]/30">
              <ArrowRightCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0A1E3F]">Convert Enquiry to Task</h3>
              <p className="text-xs text-slate-500">
                Spawn an actionable task & optionally register/link client in one step
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
        <div className="mt-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-3 text-xs text-slate-700 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[#0A1E3F] text-sm">{enquiry.leadName}</span>
            <span className="font-bold text-[#52A636] bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
              {enquiry.phone}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 pt-0.5">
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">

          {/* ========================================================= */}
          {/* SECTION 1: CLIENT REGISTRATION SHORTCUT / LINKING OPTIONS */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-extrabold text-[#0A1E3F] flex items-center space-x-1.5">
                <UserPlus className="h-4 w-4 text-[#52A636]" />
                <span>Client Registration Shortcut</span>
              </label>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                Auto-fills from Lead
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setClientOption('register')}
                className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer ${
                  clientOption === 'register'
                    ? 'bg-[#52A636] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Register as Client</span>
              </button>
              <button
                type="button"
                onClick={() => setClientOption('existing')}
                className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer ${
                  clientOption === 'existing'
                    ? 'bg-[#0A1E3F] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Link Existing Client</span>
              </button>
              <button
                type="button"
                onClick={() => setClientOption('none')}
                className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer ${
                  clientOption === 'none'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>No Client (General)</span>
              </button>
            </div>

            {/* TAB 1: REGISTER AS NEW CLIENT FIELDS */}
            {clientOption === 'register' && (
              <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Client / Business Name *
                    </label>
                    <input
                      type="text"
                      required={clientOption === 'register'}
                      value={clientFormData.clientName}
                      onChange={(e) => handleClientFieldChange('clientName', e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-medium text-slate-800 outline-none focus:border-[#52A636] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Trade / Brand Name
                    </label>
                    <input
                      type="text"
                      value={clientFormData.tradeName}
                      onChange={(e) => handleClientFieldChange('tradeName', e.target.value)}
                      placeholder="e.g. Apex Enterprises"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-medium text-slate-800 outline-none focus:border-[#52A636] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required={clientOption === 'register'}
                      value={clientFormData.phone}
                      onChange={(e) => handleClientFieldChange('phone', e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-medium text-slate-800 outline-none focus:border-[#52A636] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={clientFormData.email}
                      onChange={(e) => handleClientFieldChange('email', e.target.value)}
                      placeholder="e.g. client@mail.com"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-medium text-slate-800 outline-none focus:border-[#52A636] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Client Type
                    </label>
                    <select
                      value={clientFormData.clientType}
                      onChange={(e) => handleClientFieldChange('clientType', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-bold text-slate-800 outline-none focus:border-[#52A636] focus:bg-white"
                    >
                      <option value="Proprietorship">Proprietorship</option>
                      <option value="Individual">Individual</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="Partnership">Partnership</option>
                      <option value="LLP">LLP</option>
                      <option value="Trust/NGO">Trust/NGO</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      value={clientFormData.gstin}
                      onChange={(e) => handleClientFieldChange('gstin', e.target.value)}
                      placeholder="33AAAAA0000A1Z5"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-medium text-slate-800 uppercase outline-none focus:border-[#52A636] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      PAN Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={clientFormData.pan}
                      onChange={(e) => handleClientFieldChange('pan', e.target.value)}
                      placeholder="ABCDE1234F"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-medium text-slate-800 uppercase outline-none focus:border-[#52A636] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      City & State
                    </label>
                    <input
                      type="text"
                      value={`${clientFormData.city}, ${clientFormData.state}`}
                      onChange={(e) => handleClientFieldChange('city', e.target.value.split(',')[0])}
                      placeholder="Chennai, Tamil Nadu"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs font-medium text-slate-800 outline-none focus:border-[#52A636] focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LINK EXISTING CLIENT DROPDOWN */}
            {clientOption === 'existing' && (
              <div ref={clientDropdownRef} className="relative bg-white p-3.5 rounded-xl border border-slate-200/80">
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  Select Existing Registered Client *
                </label>
                <div
                  onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                  className={`w-full rounded-lg border p-2.5 text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                    isClientDropdownOpen
                      ? 'border-[#52A636] bg-white ring-2 ring-[#52A636]/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate pr-2">
                    {currentSelectedClientObj ? (
                      <span className="font-bold text-[#0A1E3F]">
                        {currentSelectedClientObj.clientName}
                        {currentSelectedClientObj.tradeName ? ` (${currentSelectedClientObj.tradeName})` : ''} - {currentSelectedClientObj.phone}
                      </span>
                    ) : (
                      <span className="text-slate-400">Search and pick an existing client...</span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isClientDropdownOpen ? 'rotate-180 text-[#52A636]' : ''}`} />
                </div>

                {isClientDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                      <div className="relative flex items-center">
                        <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          autoFocus
                          value={clientSearchQuery}
                          onChange={(e) => setClientSearchQuery(e.target.value)}
                          placeholder="Search client by name, code, phone..."
                          className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#52A636]"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-40 divide-y divide-slate-50 p-1">
                      {filteredExistingClients.map((client) => (
                        <div
                          key={client._id}
                          onClick={() => {
                            setSelectedExistingClient(client._id);
                            setIsClientDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition cursor-pointer ${
                            selectedExistingClient === client._id ? 'bg-emerald-50 text-[#0A1E3F] font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="truncate">
                            <div className="font-semibold text-[#0A1E3F]">{client.clientName}</div>
                            <div className="text-[11px] text-slate-400">
                              {client.clientCode} • {client.phone}
                            </div>
                          </div>
                          {selectedExistingClient === client._id && <Check className="h-4 w-4 text-[#52A636]" />}
                        </div>
                      ))}
                      {filteredExistingClients.length === 0 && (
                        <div className="py-3 text-center text-xs text-slate-400">No matching clients found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: NO CLIENT / GENERAL TASK */}
            {clientOption === 'none' && (
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-500">
                This will create a standalone General/Common Task without creating or linking a client profile in the Client directory.
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: TASK DETAILS                                  */}
          {/* ========================================================= */}
          <div className="space-y-4">
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
                placeholder="e.g. Enquiry Action: Ramesh Kumar (GST Filing)"
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
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Instructions for the assigned staff member regarding this lead..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none transition focus:border-[#52A636] focus:bg-white focus:ring-2 focus:ring-[#52A636]/20"
              />
            </div>
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
              <span>
                {loading
                  ? 'Processing...'
                  : clientOption === 'register'
                  ? 'Register Client & Create Task'
                  : 'Convert & Create Task'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ConvertToTaskModal;
