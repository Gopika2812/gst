import React, { useState } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import { Settings, Save, ShieldCheck, Mail, Bell, Building } from 'lucide-react';

const SettingsPage = () => {
  const [firmInfo, setFirmInfo] = useState({
    firmName: 'Vignesh Associates',
    tagline: 'Chartered Accountants & Tax Consultants',
    phone: '+91 98765 43210',
    email: 'contact@vigneshassociates.com',
    address: 'No. 45, Mount Road, Guindy, Chennai - 600032',
    defaultGstRate: 18,
    enableEmailAlerts: true,
    enableWhatsAppAlerts: true
  });
  const [msg, setMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg('System settings updated successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#0F2B48]">ERP System Settings</h1>
        <p className="text-xs text-slate-500">Configure Vignesh Associates firm profile, tax defaults & notifications</p>
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
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#52A636]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Tagline / Subtitle</label>
              <input
                type="text"
                value={firmInfo.tagline}
                onChange={(e) => setFirmInfo({ ...firmInfo, tagline: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#52A636]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Contact Phone</label>
              <input
                type="text"
                value={firmInfo.phone}
                onChange={(e) => setFirmInfo({ ...firmInfo, phone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#52A636]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Support Email</label>
              <input
                type="email"
                value={firmInfo.email}
                onChange={(e) => setFirmInfo({ ...firmInfo, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#52A636]"
              />
            </div>
          </div>
        </GlacierCard>

        <GlacierCard title="Notification & Automated Task Dispatch">
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">Email Notifications (Nodemailer)</p>
                <p className="text-[11px] text-slate-500">Automatically dispatch invoice PDFs and task reminders to clients</p>
              </div>
              <input
                type="checkbox"
                checked={firmInfo.enableEmailAlerts}
                onChange={(e) => setFirmInfo({ ...firmInfo, enableEmailAlerts: e.target.checked })}
                className="h-4 w-4 rounded accent-[#52A636]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">WhatsApp Integration Links</p>
                <p className="text-[11px] text-slate-500">Enable direct WhatsApp link generation for invoice sharing</p>
              </div>
              <input
                type="checkbox"
                checked={firmInfo.enableWhatsAppAlerts}
                onChange={(e) => setFirmInfo({ ...firmInfo, enableWhatsAppAlerts: e.target.checked })}
                className="h-4 w-4 rounded accent-[#52A636]"
              />
            </div>
          </div>
        </GlacierCard>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-1.5 rounded-xl bg-[#52A636] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#438A2B]"
          >
            <Save className="h-4 w-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
