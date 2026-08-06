import React, { useState, useEffect } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import Badge from '../components/common/Badge';
import api from '../services/api';
import { Award, CheckCircle2, Clock, Upload, ArrowRight, ShieldCheck } from 'lucide-react';

const CertificationPage = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [updateData, setUpdateData] = useState({
    certificateNumber: '',
    certificateReceived: 'Yes',
    receivedDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [certFile, setCertFile] = useState(null);

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/certifications');
      setCertifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const handleOpenUpdate = (cert) => {
    setSelectedCert(cert);
    setUpdateData({
      certificateNumber: cert.certificateNumber || '',
      certificateReceived: 'Yes',
      receivedDate: new Date().toISOString().split('T')[0],
      remarks: cert.remarks || ''
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('certificateNumber', updateData.certificateNumber);
      formData.append('certificateReceived', updateData.certificateReceived);
      formData.append('receivedDate', updateData.receivedDate);
      formData.append('remarks', updateData.remarks);
      formData.append('movedToBilling', true);

      if (certFile) {
        formData.append('uploadedCertificate', certFile);
      }

      await api.put(`/certifications/${selectedCert._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsUpdateModalOpen(false);
      fetchCertifications();
    } catch (err) {
      alert('Failed to update certification');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0F2B48]">Certification Status & Tracking (Module 2)</h1>
        <p className="text-xs text-slate-500">
          Workflow: Client Registration ➔ Waiting Certificate ➔ Certificate Received ➔ Move to Billing
        </p>
      </div>

      {/* Workflow Visual Timeline Banner */}
      <GlacierCard className="p-4 bg-gradient-to-r from-slate-900 to-[#0F2B48] text-white">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">1</span>
            <span>Client Registration</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs text-white">2</span>
            <span>Waiting Certificate</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#52A636] text-xs text-white">3</span>
            <span>Certificate Received</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white">4</span>
            <span>Move to Billing</span>
          </div>
        </div>
      </GlacierCard>

      {/* Certifications Table */}
      <GlacierCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2B48] text-white">
              <tr>
                <th className="p-3.5 font-semibold">Client Name</th>
                <th className="p-3.5 font-semibold">Certificate Type</th>
                <th className="p-3.5 font-semibold">Application Date</th>
                <th className="p-3.5 font-semibold">Expected Date</th>
                <th className="p-3.5 font-semibold">Cert Number</th>
                <th className="p-3.5 font-semibold">Received?</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading certification records...</td>
                </tr>
              ) : certifications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No pending certification tracking records</td>
                </tr>
              ) : (
                certifications.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-800">
                      {c.client?.clientName || 'N/A'}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{c.certificateType}</td>
                    <td className="p-3.5 text-slate-600">
                      {new Date(c.applicationDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {c.expectedDate ? new Date(c.expectedDate).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-800">
                      {c.certificateNumber || 'Pending'}
                    </td>
                    <td className="p-3.5">
                      <Badge status={c.certificateReceived === 'Yes' ? 'Yes' : 'Pending'} text={c.certificateReceived} />
                    </td>
                    <td className="p-3.5">
                      <Badge status={c.status} />
                    </td>
                    <td className="p-3.5 text-center">
                      {c.status === 'Certificate Received' ? (
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Moved to Billing
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenUpdate(c)}
                          className="rounded-lg bg-[#52A636] px-3 py-1 text-xs font-semibold text-white hover:bg-[#438A2B]"
                        >
                          Update Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlacierCard>

      {/* Update Certificate Modal */}
      {isUpdateModalOpen && selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#0F2B48]">Update Certificate Received</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Client: {selectedCert.client?.clientName} ({selectedCert.certificateType})
            </p>

            <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Certificate Number *</label>
                <input
                  type="text"
                  required
                  value={updateData.certificateNumber}
                  onChange={(e) => setUpdateData({ ...updateData, certificateNumber: e.target.value })}
                  placeholder="e.g. 33AAACA1234F1Z5"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Received Date</label>
                <input
                  type="date"
                  value={updateData.receivedDate}
                  onChange={(e) => setUpdateData({ ...updateData, receivedDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Upload Certificate File</label>
                <input
                  type="file"
                  onChange={(e) => setCertFile(e.target.files[0])}
                  className="mt-1 w-full text-slate-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Remarks</label>
                <textarea
                  rows={2}
                  value={updateData.remarks}
                  onChange={(e) => setUpdateData({ ...updateData, remarks: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#52A636] px-4 py-2 font-semibold text-white hover:bg-[#438A2B]"
                >
                  Confirm & Move to Billing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationPage;
