import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, FileText, Building2, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const ServiceMasterModal = ({ isOpen, onClose }) => {
  const [services, setServices] = useState([]);
  const [selectedDept, setSelectedDept] = useState('GST Filing');
  const [loading, setLoading] = useState(true);

  // Form State for Adding New Sub-Service
  const [serviceName, setServiceName] = useState('');
  const [subServiceName, setSubServiceName] = useState('');
  const [startDayOfMonth, setStartDayOfMonth] = useState(1);
  const [dueDayOfMonth, setDueDayOfMonth] = useState(11);
  const [periodicity, setPeriodicity] = useState('Monthly');
  const [description, setDescription] = useState('');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceName.trim() || !subServiceName.trim()) {
      setFormError('Service Name and Sub-Service Name are required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.post('/services', {
        department: selectedDept,
        serviceName,
        subServiceName,
        startDayOfMonth: Number(startDayOfMonth),
        dueDayOfMonth: Number(dueDayOfMonth),
        periodicity,
        description
      });

      // Reset form
      setServiceName('');
      setSubServiceName('');
      setStartDayOfMonth(1);
      setDueDayOfMonth(11);
      setDescription('');

      fetchServices();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this master sub-service?')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      alert('Failed to delete service');
    }
  };

  const filteredServices = services.filter((s) => s.department === selectedDept || (selectedDept === 'GST Filing' && s.department === 'GST') || (selectedDept === 'Income Tax' && s.department === 'IT Filing'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-[#52A636] px-2 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                System Master Settings
              </span>
              <h3 className="text-lg font-bold text-[#0F2B48]">Services & Sub-Services Master</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure Department Services, Sub-Services, Start Days, Due Days, and Reminder Windows
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Department Tabs */}
        <div className="mt-4 flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {['GST Filing', 'Income Tax', 'Accounts'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-[#0F2B48] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept} Services
            </button>
          ))}
        </div>

        {/* Form to Add New Sub-Service */}
        <form onSubmit={handleAddService} className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
          <h4 className="text-xs font-bold text-[#0F2B48] flex items-center space-x-1.5">
            <Plus className="h-4 w-4 text-[#52A636]" />
            <span>Add New Sub-Service under {selectedDept}</span>
          </h4>

          {formError && <div className="text-xs text-rose-600 font-medium">{formError}</div>}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700">Main Service Name *</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. GST Returns"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#52A636]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700">Sub-Service Name *</label>
              <input
                type="text"
                required
                value={subServiceName}
                onChange={(e) => setSubServiceName(e.target.value)}
                placeholder="e.g. GSTR-1 (Outward)"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#52A636]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700">Periodicity / Frequency</label>
              <select
                value={periodicity}
                onChange={(e) => setPeriodicity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#52A636]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
                <option value="One-time">One-time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700">Reminder Start Day (of Month) *</label>
              <input
                type="number"
                min={1}
                max={31}
                required
                value={startDayOfMonth}
                onChange={(e) => setStartDayOfMonth(e.target.value)}
                placeholder="1 (e.g. 1st of month)"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#52A636]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700">Service Due Day (of Month) *</label>
              <input
                type="number"
                min={1}
                max={31}
                required
                value={dueDayOfMonth}
                onChange={(e) => setDueDayOfMonth(e.target.value)}
                placeholder="11 (e.g. 11th of month)"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#52A636]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700">Description / Guidelines</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief filing instructions..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#52A636]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#52A636] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#438A2B] transition"
            >
              {submitting ? 'Adding...' : '+ Add Sub-Service'}
            </button>
          </div>
        </form>

        {/* Table of Configured Master Services */}
        <div className="mt-5 space-y-2">
          <h4 className="text-xs font-extrabold text-[#0F2B48]">
            Configured Master Services ({selectedDept})
          </h4>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading master services...</div>
          ) : filteredServices.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No services configured under {selectedDept} yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="p-3">Main Service</th>
                    <th className="p-3">Sub-Service Name</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Reminder Start</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredServices.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-semibold text-[#0F2B48]">{s.serviceName}</td>
                      <td className="p-3 font-extrabold text-slate-900">{s.subServiceName}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {s.periodicity}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-blue-600">Day {s.startDayOfMonth} of Month</td>
                      <td className="p-3 font-bold text-rose-600">Day {s.dueDayOfMonth} of Month</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Delete master service"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 flex justify-end border-t border-slate-100 pt-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceMasterModal;
