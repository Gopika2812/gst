import React, { useState, useEffect } from 'react';
import { X, Upload, Building, CreditCard, ShieldCheck, Search, CheckCircle2, AlertCircle, PhoneCall } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ClientModal = ({ isOpen, onClose, onRefresh, employees = [] }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [registrationCategory, setRegistrationCategory] = useState('New Client');
  const [existingClientId, setExistingClientId] = useState(null);

  // Phone Lookup State for Option 2
  const [searchPhone, setSearchPhone] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResultMsg, setLookupResultMsg] = useState('');
  const [lookupStatus, setLookupStatus] = useState(null); // 'success' | 'not_found' | null

  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    email: '',
    clientGroup: 'General',
    clientType: 'Proprietorship',
    responsibleEmployee: '',
    leadSource: 'Direct',
    tradeName: '',
    businessType: 'Services',
    cin: '',
    llpin: '',
    dateOfIncorporation: '',
    pan: '',
    tan: '',
    gstin: '',
    gstType: 'Regular',
    state: 'Tamil Nadu',
    address: '',
    contactPerson: '',
    billingAddress: '',
    city: 'Chennai',
    pincode: '',
    openingBalance: 0,
    creditLimit: 50000,
    remarks: ''
  });

  const [masterServices, setMasterServices] = useState([]);
  const [subscribedServices, setSubscribedServices] = useState([]);

  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/services').then((res) => setMasterServices(res.data)).catch(console.error);
      resetModalState();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetModalState = () => {
    setExistingClientId(null);
    setSearchPhone('');
    setLookupLoading(false);
    setLookupResultMsg('');
    setLookupStatus(null);
    setSubscribedServices([]);
    setFiles({});
    setError('');
    setFormData({
      clientName: '',
      phone: '',
      email: '',
      clientGroup: 'General',
      clientType: 'Proprietorship',
      responsibleEmployee: '',
      leadSource: 'Direct',
      tradeName: '',
      businessType: 'Services',
      cin: '',
      llpin: '',
      dateOfIncorporation: '',
      pan: '',
      tan: '',
      gstin: '',
      gstType: 'Regular',
      state: 'Tamil Nadu',
      address: '',
      contactPerson: '',
      billingAddress: '',
      city: 'Chennai',
      pincode: '',
      openingBalance: 0,
      creditLimit: 50000,
      remarks: ''
    });
  };

  const handleCategorySwitch = (cat) => {
    setRegistrationCategory(cat);
    if (cat === 'New Client') {
      resetModalState();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  // Phone Lookup for Existing Clients (Option 2)
  const handlePhoneLookup = async () => {
    if (!searchPhone.trim()) {
      setLookupResultMsg('Please enter a valid phone number to search.');
      setLookupStatus('not_found');
      return;
    }

    setLookupLoading(true);
    setLookupResultMsg('');
    setLookupStatus(null);

    try {
      const res = await api.get(`/clients/lookup-phone/${encodeURIComponent(searchPhone.trim())}`);
      const client = res.data;

      setExistingClientId(client._id);
      setLookupStatus('success');
      setLookupResultMsg(`Found Client: ${client.clientName} (${client.clientCode || 'Code N/A'})`);

      // Auto-fill form fields
      setFormData({
        clientName: client.clientName || '',
        phone: client.phone || searchPhone,
        email: client.email || '',
        clientGroup: client.clientGroup || 'General',
        clientType: client.clientType || 'Proprietorship',
        responsibleEmployee: client.responsibleEmployee?._id || client.responsibleEmployee || '',
        leadSource: client.leadSource || 'Direct',
        tradeName: client.tradeName || '',
        businessType: client.businessType || 'Services',
        cin: client.cin || '',
        llpin: client.llpin || '',
        dateOfIncorporation: client.dateOfIncorporation ? new Date(client.dateOfIncorporation).toISOString().split('T')[0] : '',
        pan: client.pan || '',
        tan: client.tan || '',
        gstin: client.gstin || '',
        gstType: client.gstType || 'Regular',
        state: client.state || 'Tamil Nadu',
        address: client.address || '',
        contactPerson: client.contactPerson || '',
        billingAddress: client.billingAddress || '',
        city: client.city || 'Chennai',
        pincode: client.pincode || '',
        openingBalance: client.openingBalance || 0,
        creditLimit: client.creditLimit || 50000,
        remarks: client.remarks || ''
      });

      if (client.subscribedServices && Array.isArray(client.subscribedServices)) {
        setSubscribedServices(client.subscribedServices);
      }
    } catch (err) {
      setExistingClientId(null);
      setLookupStatus('not_found');
      setLookupResultMsg(err.response?.data?.message || 'No existing client found with this contact number. You can fill out details below to add them.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleToggleSubService = (serviceItem) => {
    const existsIndex = subscribedServices.findIndex((s) => s.subServiceName === serviceItem.subServiceName);
    if (existsIndex > -1) {
      setSubscribedServices(subscribedServices.filter((_, idx) => idx !== existsIndex));
    } else {
      setSubscribedServices([
        ...subscribedServices,
        {
          department: serviceItem.department,
          serviceName: serviceItem.serviceName,
          subServiceName: serviceItem.subServiceName,
          assignedStaff: formData.responsibleEmployee || '',
          startDayOfMonth: serviceItem.startDayOfMonth,
          dueDayOfMonth: serviceItem.dueDayOfMonth,
          periodicity: serviceItem.periodicity
        }
      ]);
    }
  };

  const handleSubServiceStaffChange = (subServiceName, staffId) => {
    setSubscribedServices((prev) =>
      prev.map((s) => (s.subServiceName === subServiceName ? { ...s, assignedStaff: staffId } : s))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      data.append('registrationCategory', registrationCategory);
      data.append('subscribedServices', JSON.stringify(subscribedServices));

      if (files.panDoc) data.append('panDoc', files.panDoc);
      if (files.gstDoc) data.append('gstDoc', files.gstDoc);
      if (files.aadhaarDoc) data.append('aadhaarDoc', files.aadhaarDoc);
      if (files.certificateDoc) data.append('certificateDoc', files.certificateDoc);

      if (existingClientId) {
        // Update existing client
        await api.put(`/clients/${existingClientId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new client record
        await api.post('/clients', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onRefresh && onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process client registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#0F2B48]">Client Registration (Module 1)</h3>
            <p className="text-xs text-slate-500">Register new or existing client accounts into Auditor ERP</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-200">{error}</div>}

        {/* Option Toggle Tabs */}
        <div className="mt-4 flex flex-col sm:flex-row gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => handleCategorySwitch('New Client')}
            className={`flex-1 rounded-lg py-2.5 px-3 text-xs font-bold transition flex items-center justify-center space-x-2 ${
              registrationCategory === 'New Client'
                ? 'bg-white text-[#0F2B48] shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Option 1: New Client (No Registrations Yet)</span>
          </button>
          <button
            type="button"
            onClick={() => handleCategorySwitch('Registered Client')}
            className={`flex-1 rounded-lg py-2.5 px-3 text-xs font-bold transition flex items-center justify-center space-x-2 ${
              registrationCategory === 'Registered Client'
                ? 'bg-[#52A636] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Option 2: Registered Client (Existing GST/PAN)</span>
          </button>
        </div>

        {/* Informational Banner based on Option Selected */}
        {registrationCategory === 'New Client' ? (
          <div className="mt-3 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-800 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              <strong>New Client Phase:</strong> Client is completely new for GST / IT / Bookkeeping. This automatically initiates Certificate Tracking in <strong>Module 2 (Waiting For Certificate)</strong>.
            </span>
          </div>
        ) : (
          <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
              <PhoneCall className="h-4 w-4 text-[#52A636]" />
              <span>Track & Auto-fill Existing Client via Phone Number</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Enter the client's contact phone number to search existing records and update services or staff assignments without registering a new certificate.
            </p>

            {/* Phone Lookup Input Bar */}
            <div className="flex items-center space-x-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="Enter Contact Phone Number (e.g. 98400 11223)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
              <button
                type="button"
                onClick={handlePhoneLookup}
                disabled={lookupLoading}
                className="flex items-center space-x-1 rounded-xl bg-[#0F2B48] px-4 py-2 text-xs font-bold text-white hover:bg-[#16385C] transition shrink-0"
              >
                <Search className="h-3.5 w-3.5" />
                <span>{lookupLoading ? 'Searching...' : 'Lookup Phone'}</span>
              </button>
            </div>

            {lookupResultMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs font-medium border flex items-center space-x-2 ${
                  lookupStatus === 'success'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {lookupStatus === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                )}
                <span>{lookupResultMsg}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Section 1: Basic Info */}
          <div>
            <h4 className="flex items-center text-xs font-bold text-[#0F2B48] uppercase tracking-wider mb-3">
              <Building className="mr-1.5 h-4 w-4 text-[#52A636]" /> Basic Information
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  required
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Logistics Solutions"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98400 11223"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="client@company.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Client Type</label>
                <select
                  name="clientType"
                  value={formData.clientType}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                >
                  <option>Proprietorship</option>
                  <option>Partnership</option>
                  <option>LLP</option>
                  <option>Private Limited</option>
                  <option>Public Limited</option>
                  <option>Individual</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Responsible Staff</label>
                <select
                  name="responsibleEmployee"
                  value={formData.responsibleEmployee}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                >
                  <option value="">Select Employee</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name} ({e.department})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Client Group</label>
                <input
                  type="text"
                  name="clientGroup"
                  value={formData.clientGroup}
                  onChange={handleChange}
                  placeholder="e.g. Corporate / Retail"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Business & Tax Information */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="flex items-center text-xs font-bold text-[#0F2B48] uppercase tracking-wider mb-3">
              <CreditCard className="mr-1.5 h-4 w-4 text-[#52A636]" /> Tax & Business Information
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Trade Name</label>
                <input
                  type="text"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Express"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">PAN Number</label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="AAACA1234F"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs uppercase outline-none focus:border-[#52A636]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">GSTIN Number</label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="33AAACA1234F1Z5"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs uppercase outline-none focus:border-[#52A636]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">CIN / LLPIN</label>
                <input
                  type="text"
                  name="cin"
                  value={formData.cin}
                  onChange={handleChange}
                  placeholder="U60200TN2021PTC145890"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs uppercase outline-none focus:border-[#52A636]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">GST Type</label>
                <select
                  name="gstType"
                  value={formData.gstType}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                >
                  <option>Regular</option>
                  <option>Composition</option>
                  <option>SEZ</option>
                  <option>Casual</option>
                  <option>Unregistered</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financials & Credit Limit */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="flex items-center text-xs font-bold text-[#0F2B48] uppercase tracking-wider mb-3">
              <ShieldCheck className="mr-1.5 h-4 w-4 text-[#52A636]" /> Financial Setup
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Opening Balance (₹)</label>
                <input
                  type="number"
                  name="openingBalance"
                  value={formData.openingBalance}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-600">Credit Limit (₹)</label>
                  {!isSuperAdmin && (
                    <span className="text-[9px] text-amber-600 font-medium">(Super Admin Only Edit)</span>
                  )}
                </div>
                <input
                  type="number"
                  name="creditLimit"
                  disabled={!isSuperAdmin}
                  value={formData.creditLimit}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-xl border p-2 text-xs outline-none ${
                    isSuperAdmin ? 'border-slate-200 focus:border-[#52A636]' : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">City / Location</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Subscribed Department Services & Staff Assignment */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="flex items-center text-xs font-bold text-[#0F2B48] uppercase tracking-wider">
                <ShieldCheck className="mr-1.5 h-4 w-4 text-[#52A636]" /> Client Subscribed Services & Staff Reminders
              </h4>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {subscribedServices.length} Selected
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Select Department Sub-Services required by this client. Assigned staff will get automated start day to due date reminders.
            </p>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {masterServices.map((ms) => {
                const isSelected = subscribedServices.some((s) => s.subServiceName === ms.subServiceName);
                const selectedSub = subscribedServices.find((s) => s.subServiceName === ms.subServiceName);

                return (
                  <div
                    key={ms._id}
                    className={`rounded-2xl p-3 border transition ${
                      isSelected ? 'border-[#52A636] bg-emerald-50/40 shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSubService(ms)}
                          className="h-4 w-4 rounded accent-[#52A636] cursor-pointer"
                        />
                        <div>
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {ms.department}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 mt-1">{ms.subServiceName}</h5>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        Day {ms.startDayOfMonth} ➔ Day {ms.dueDayOfMonth}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <label className="text-[10px] font-semibold text-slate-600">Assign Staff:</label>
                        <select
                          value={selectedSub?.assignedStaff || formData.responsibleEmployee || ''}
                          onChange={(e) => handleSubServiceStaffChange(ms.subServiceName, e.target.value)}
                          className="text-xs rounded-lg border border-slate-300 bg-white p-1 outline-none max-w-[180px]"
                        >
                          <option value="">-- Select Staff --</option>
                          {employees.map((e) => (
                            <option key={e._id} value={e._id}>
                              {e.name} ({e.department})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Document Image Uploads */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-[#0F2B48] uppercase tracking-wider mb-3">Document Image Uploads</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-600">Upload PAN Image</label>
                <input type="file" accept="image/*,.pdf" name="panDoc" onChange={handleFileChange} className="mt-1 w-full text-xs text-slate-500" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600">Upload GST Cert Image</label>
                <input type="file" accept="image/*,.pdf" name="gstDoc" onChange={handleFileChange} className="mt-1 w-full text-xs text-slate-500" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600">Upload Aadhaar Image</label>
                <input type="file" accept="image/*,.pdf" name="aadhaarDoc" onChange={handleFileChange} className="mt-1 w-full text-xs text-slate-500" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600">Upload Incorporation Cert</label>
                <input type="file" accept="image/*,.pdf" name="certificateDoc" onChange={handleFileChange} className="mt-1 w-full text-xs text-slate-500" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4">
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
              className="rounded-xl bg-[#52A636] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#438A2B]"
            >
              {loading ? 'Saving Client...' : existingClientId ? 'Update Existing Client & Services' : 'Register Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
