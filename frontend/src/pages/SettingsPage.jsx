import React, { useState } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import ServiceMasterModal from '../components/services/ServiceMasterModal';
import { Settings, Save, ShieldCheck, Mail, Bell, Building, Layers, ArrowRight } from 'lucide-react';

const SettingsPage = () => {
  const [firmInfo, setFirmInfo] = useState({
    firmName: 'Vignesh Associates',
    tagline: 'Chartered Accountants & Tax Consultants',
    phone: '+91 98765 43210',
    email: 'contact@vigneshassociates.com',
    address: 'No. 45, Mount Road, Guindy, Chennai - 600032',
    defaultGstRate: 18
  });
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg('System settings updated successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-[#0F2B48]">ERP System Settings</h1>
        <p className="text-xs text-slate-500">Configure Vignesh Associates firm profile, tax defaults & master services</p>
      </div>

      {msg && <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">{msg}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <GlacierCard title="Firm Profile & Contact Information">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Firm Name</label>
              <input
                type="text"
                value={firmInfo.firmName}
                onChange={(e) => setFirmInfo({ ...firmInfo, firmName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#C59B27]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Tagline / Subtitle</label>
              <input
                type="text"
                value={firmInfo.tagline}
                onChange={(e) => setFirmInfo({ ...firmInfo, tagline: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#C59B27]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Contact Phone</label>
              <input
                type="text"
                value={firmInfo.phone}
                onChange={(e) => setFirmInfo({ ...firmInfo, phone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#C59B27]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Support Email</label>
              <input
                type="email"
                value={firmInfo.email}
                onChange={(e) => setFirmInfo({ ...firmInfo, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#C59B27]"
              />
            </div>
          </div>
        </GlacierCard>

        {/* Master Services & Sub-Services Configuration Card */}
        <GlacierCard title="Master Services & Sub-Services Setup">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <h4 className="text-xs font-extrabold text-[#0A1E3F] flex items-center space-x-1.5">
                <Layers className="h-4 w-4 text-[#C59B27]" />
                <span>Department Services, Start Days & Due Days Master</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Manage GSTR-1, GSTR-3B, ITR, TDS, and Accounts sub-services with automated start date & due date reminder windows.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsServiceModalOpen(true)}
              className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#0A1E3F] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#16385C] transition shrink-0"
            >
              <span>Manage Services & Sub-Services</span>
              <ArrowRight className="h-4 w-4 text-[#C59B27]" />
            </button>
          </div>
        </GlacierCard>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#C59B27] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#A68018] w-full sm:w-auto"
          >
            <Save className="h-4 w-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>

      {/* Service Master Modal */}
      <ServiceMasterModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
