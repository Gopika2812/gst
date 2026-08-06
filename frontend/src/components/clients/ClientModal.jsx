import React, { useState } from 'react';
import { X, Upload, Building, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ClientModal = ({ isOpen, onClose, onRefresh, employees = [] }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [registrationCategory, setRegistrationCategory] = useState('Registered Client');
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

  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
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

      if (files.panDoc) data.append('panDoc', files.panDoc);
      if (files.gstDoc) data.append('gstDoc', files.gstDoc);
      if (files.aadhaarDoc) data.append('aadhaarDoc', files.aadhaarDoc);
      if (files.certificateDoc) data.append('certificateDoc', files.certificateDoc);

      await api.post('/clients', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

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

        {/* Option Toggle */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setRegistrationCategory('Option 1: New Client')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              registrationCategory === 'Option 1: New Client'
                ? 'bg-white text-[#0F2B48] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Option 1: New Client (No Registrations Yet)
          </button>
          <button
            type="button"
            onClick={() => setRegistrationCategory('Registered Client')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              registrationCategory === 'Registered Client'
                ? 'bg-[#52A636] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Option 2: Registered Client (Existing GST/PAN)
          </button>
        </div>

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
                <label className="text-[11px] font-semibold text-slate-600">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98400 11223"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Email</label>
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

          {/* Document Uploads */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-[#0F2B48] uppercase tracking-wider mb-3">Document Uploads</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-600">Upload PAN</label>
                <input type="file" name="panDoc" onChange={handleFileChange} className="mt-1 w-full text-xs text-slate-500" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600">Upload GST Certificate</label>
                <input type="file" name="gstDoc" onChange={handleFileChange} className="mt-1 w-full text-xs text-slate-500" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600">Upload Aadhaar</label>
                <input type="file" name="aadhaarDoc" onChange={handleFileChange} className="mt-1 w-full text-xs text-slate-500" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600">Upload Incorporation Cert</label>
                <input type="file" name="certificateDoc" onChange={handleFileChange} className="mt-1 w-full text-xs text-slate-500" />
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
              className="rounded-xl bg-[#52A636] px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#438A2B]"
            >
              {loading ? 'Saving Client...' : 'Register Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
