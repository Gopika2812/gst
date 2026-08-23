import React, { useState, useEffect } from 'react';
import { X, Building, CreditCard, ShieldCheck, Search, CheckCircle2, AlertCircle, PhoneCall, Layers } from 'lucide-react';
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
  const [lookupStatus, setLookupStatus] = useState(null);

  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    email: '',
    clientType: 'Proprietorship',
    tradeName: '',
    businessType: 'Services',
    pan: '',
    tan: '',
    gstin: '',
    state: 'Tamil Nadu',
    address: '',
    contactPerson: '',
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
      clientType: 'Proprietorship',
      tradeName: '',
      businessType: 'Services',
      pan: '',
      tan: '',
      gstin: '',
      state: 'Tamil Nadu',
      address: '',
      contactPerson: '',
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
      setLookupResultMsg('Please enter a valid phone number.');
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
      setLookupResultMsg(`Client Found: ${client.clientName}`);

      // Auto-fill form fields
      setFormData({
        clientName: client.clientName || '',
        phone: client.phone || searchPhone,
        email: client.email || '',
        clientType: client.clientType || 'Proprietorship',
        tradeName: client.tradeName || '',
        businessType: client.businessType || 'Services',
        pan: client.pan || '',
        tan: client.tan || '',
        gstin: client.gstin || '',
        state: client.state || 'Tamil Nadu',
        address: client.address || '',
        contactPerson: client.contactPerson || '',
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
      setLookupResultMsg('No record found for this phone number. You can enter details below to register.');
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
          assignedStaff: '',
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
        await api.put(`/clients/${existingClientId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/clients', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onRefresh && onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#0F2B48]">Client Registration</h3>
            <p className="text-xs text-slate-500">Add or update client service subscriptions</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs font-semibold text-rose-600 border border-rose-200">{error}</div>}

        {/* Clean Option Switcher */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => handleCategorySwitch('New Client')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              registrationCategory === 'New Client'
                ? 'bg-white text-[#0F2B48] shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            New Client Registration
          </button>
          <button
            type="button"
            onClick={() => handleCategorySwitch('Registered Client')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              registrationCategory === 'Registered Client'
                ? 'bg-[#52A636] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Existing Client (Phone Lookup)
          </button>
        </div>

        {/* Phone Lookup for Existing Clients */}
        {registrationCategory === 'Registered Client' && (
          <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Enter Phone Number (e.g. 9840011223)..."
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#52A636]"
              />
              <button
                type="button"
                onClick={handlePhoneLookup}
                disabled={lookupLoading}
                className="rounded-xl bg-[#0F2B48] px-4 py-2 text-xs font-bold text-white hover:bg-[#16385C] transition shrink-0 flex items-center space-x-1"
              >
                <Search className="h-3.5 w-3.5" />
                <span>{lookupLoading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>

            {lookupResultMsg && (
              <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${lookupStatus === 'success' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {lookupResultMsg}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* STEP 1: Basic Information */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-[#0F2B48] flex items-center space-x-1.5">
              <Building className="h-4 w-4 text-[#52A636]" />
              <span>Step 1: Basic Details</span>
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  required
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Logistics"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Phone Number *</label>
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
                <label className="text-[11px] font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="client@company.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Service Subscriptions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#0F2B48] flex items-center space-x-1.5">
                <Layers className="h-4 w-4 text-[#52A636]" />
                <span>Step 2: Subscribed Services ({subscribedServices.length})</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {masterServices.map((ms) => {
                const isSelected = subscribedServices.some((s) => s.subServiceName === ms.subServiceName);
                const selectedSub = subscribedServices.find((s) => s.subServiceName === ms.subServiceName);

                return (
                  <div
                    key={ms._id}
                    className={`rounded-xl p-2.5 border transition ${
                      isSelected ? 'border-[#52A636] bg-emerald-50/40' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSubService(ms)}
                          className="h-4 w-4 rounded accent-[#52A636]"
                        />
                        <span className="text-xs font-bold text-slate-800">{ms.subServiceName}</span>
                      </label>
                      <span className="text-[10px] font-semibold text-slate-400">{ms.department}</span>
                    </div>

                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-semibold">Assign Staff:</span>
                        <select
                          value={selectedSub?.assignedStaff || ''}
                          onChange={(e) => handleSubServiceStaffChange(ms.subServiceName, e.target.value)}
                          className="text-xs rounded-lg border border-slate-300 bg-white p-1 outline-none max-w-[170px]"
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

          {/* STEP 3: Business & Tax Details */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-[#0F2B48] flex items-center space-x-1.5">
              <CreditCard className="h-4 w-4 text-[#52A636]" />
              <span>Step 3: Tax & Business Details</span>
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Trade Name</label>
                <input
                  type="text"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleChange}
                  placeholder="Trade Name"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700">PAN Number</label>
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
                <label className="text-[11px] font-semibold text-slate-700">GSTIN Number</label>
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
                <label className="text-[11px] font-semibold text-slate-700">State</label>
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

          {/* STEP 4: Financials & Location */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-[#0F2B48] flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-[#52A636]" />
              <span>Step 4: Financial Setup</span>
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Opening Balance (₹)</label>
                <input
                  type="number"
                  name="openingBalance"
                  value={formData.openingBalance}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Credit Limit (₹)</label>
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
                <label className="text-[11px] font-semibold text-slate-700">City / Location</label>
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

          {/* STEP 5: Document Uploads */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-[#0F2B48]">Step 5: Document Uploads</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-slate-600">PAN Image</label>
                <input type="file" accept="image/*,.pdf" name="panDoc" onChange={handleFileChange} className="mt-1 w-full text-slate-500 text-[11px]" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600">GST Cert Image</label>
                <input type="file" accept="image/*,.pdf" name="gstDoc" onChange={handleFileChange} className="mt-1 w-full text-slate-500 text-[11px]" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600">Aadhaar Image</label>
                <input type="file" accept="image/*,.pdf" name="aadhaarDoc" onChange={handleFileChange} className="mt-1 w-full text-slate-500 text-[11px]" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600">Incorporation Cert</label>
                <input type="file" accept="image/*,.pdf" name="certificateDoc" onChange={handleFileChange} className="mt-1 w-full text-slate-500 text-[11px]" />
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#52A636] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#438A2B] transition"
            >
              {loading ? 'Saving...' : existingClientId ? 'Update Client' : 'Register Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
