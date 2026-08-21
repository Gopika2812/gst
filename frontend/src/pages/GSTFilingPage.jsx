import React, { useState, useEffect } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import Badge from '../components/common/Badge';
import api from '../services/api';
import { FileCheck, Upload, Download, CheckCircle2, Plus } from 'lucide-react';

const GSTFilingPage = () => {
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    client: '',
    filingPeriod: 'July 2026',
    acknowledgementNumber: '',
    remarks: ''
  });
  const [fileDoc, setFileDoc] = useState(null);

  const fetchFilings = async () => {
    setLoading(true);
    try {
      const [filRes, clientRes] = await Promise.all([
        api.get('/filings', { params: { department: 'GST' } }),
        api.get('/clients')
      ]);
      setFilings(filRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('client', formData.client);
      data.append('department', 'GST');
      data.append('filingPeriod', formData.filingPeriod);
      data.append('acknowledgementNumber', formData.acknowledgementNumber);
      data.append('remarks', formData.remarks);
      if (fileDoc) data.append('filedDocument', fileDoc);

      await api.post('/filings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsModalOpen(false);
      fetchFilings();
    } catch (err) {
      alert('Failed to upload GST filing record');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F2B48]">GST Filing Workspace</h1>
          <p className="text-xs text-slate-500">Manage GSTR-3B, GSTR-1, CMP08, GSTR-9 returns & filing acknowledgements</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#52A636] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#438A2B] w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Filed Return</span>
        </button>
      </div>

      <GlacierCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-[#0F2B48] text-white">
              <tr>
                <th className="p-3.5 font-semibold">Client Name</th>
                <th className="p-3.5 font-semibold">GSTIN</th>
                <th className="p-3.5 font-semibold">Filing Period</th>
                <th className="p-3.5 font-semibold">ACK Number</th>
                <th className="p-3.5 font-semibold">Filing Date</th>
                <th className="p-3.5 font-semibold">Filed By</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 text-center font-semibold">Proof File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading GST filing records...</td>
                </tr>
              ) : filings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No GST filing records submitted</td>
                </tr>
              ) : (
                filings.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-800">{f.client?.clientName}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-700">{f.client?.gstin || 'N/A'}</td>
                    <td className="p-3.5 font-semibold text-[#0F2B48]">{f.filingPeriod}</td>
                    <td className="p-3.5 font-mono text-[11px] text-emerald-700">{f.acknowledgementNumber || 'ACK-PENDING'}</td>
                    <td className="p-3.5 text-slate-600">{new Date(f.filingDate).toLocaleDateString('en-IN')}</td>
                    <td className="p-3.5 font-medium text-slate-800">{f.filedBy?.name || 'GST Staff'}</td>
                    <td className="p-3.5">
                      <Badge status={f.status} />
                    </td>
                    <td className="p-3.5 text-center">
                      {f.filedDocumentUrl ? (
                        <a
                          href={f.filedDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#52A636] hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>View Proof</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400">No file</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlacierCard>

      {/* Upload Filing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#0F2B48]">Upload GST Filing Acknowledgement</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Select Client *</label>
                <select
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.clientName} ({c.gstin || 'No GST'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Filing Period *</label>
                <input
                  type="text"
                  required
                  value={formData.filingPeriod}
                  onChange={(e) => setFormData({ ...formData, filingPeriod: e.target.value })}
                  placeholder="e.g. July 2026 / Q1 2026"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">GST ACK Number</label>
                <input
                  type="text"
                  value={formData.acknowledgementNumber}
                  onChange={(e) => setFormData({ ...formData, acknowledgementNumber: e.target.value })}
                  placeholder="e.g. AA3307261234567"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Upload Filed Acknowledgement PDF</label>
                <input
                  type="file"
                  onChange={(e) => setFileDoc(e.target.files[0])}
                  className="mt-1 w-full text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#52A636] px-4 py-2 font-semibold text-white hover:bg-[#438A2B]"
                >
                  Submit Filing Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GSTFilingPage;
