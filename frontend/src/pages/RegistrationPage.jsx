import React, { useState, useEffect } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import Badge from '../components/common/Badge';
import FilePreviewModal from '../components/common/FilePreviewModal';
import api from '../services/api';
import { Building2, Eye, Download, FileText } from 'lucide-react';

const RegistrationPage = () => {
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: '',
    title: '',
    subtitle: '',
    certNumber: ''
  });

  useEffect(() => {
    const fetchFilings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/filings', { params: { department: 'Registration' } });
        setFilings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilings();
  }, []);

  const handlePreviewDoc = (f) => {
    setPreviewModal({
      isOpen: true,
      fileUrl: f.filedDocumentUrl,
      fileName: `${f.client?.clientName || 'Client'}_${f.filingPeriod}_License`,
      title: `${f.client?.clientName || 'Client'} - ${f.filingPeriod} License/Certificate`,
      subtitle: `Ack No: ${f.acknowledgementNumber || 'REG-SUBMITTED'} • Date: ${new Date(f.filingDate).toLocaleDateString('en-IN')}`,
      certNumber: f.acknowledgementNumber || ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-[#0A1E3F]">Registration & Licensing Workspace</h1>
        <p className="text-xs text-slate-500">Udyam MSME, LLP, Private Limited, FSSAI License, ESI/EPF, Trade License & Certifications</p>
      </div>

      <GlacierCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-[#0A1E3F] text-white">
              <tr>
                <th className="p-3.5 font-semibold">Client Name</th>
                <th className="p-3.5 font-semibold">Registration Type</th>
                <th className="p-3.5 font-semibold">Application Number</th>
                <th className="p-3.5 font-semibold">Completion Date</th>
                <th className="p-3.5 font-semibold">Assigned Staff</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 text-center font-semibold">License / Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading registration records...</td>
                </tr>
              ) : filings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No completed registration records logged</td>
                </tr>
              ) : (
                filings.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-800">{f.client?.clientName}</td>
                    <td className="p-3.5 font-semibold text-[#0A1E3F]">{f.filingPeriod}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-700">{f.acknowledgementNumber || 'REG-SUBMITTED'}</td>
                    <td className="p-3.5 text-slate-600">{new Date(f.filingDate).toLocaleDateString('en-IN')}</td>
                    <td className="p-3.5 font-medium text-slate-800">{f.filedBy?.name || 'Registration Team'}</td>
                    <td className="p-3.5">
                      <Badge status={f.status} />
                    </td>
                    <td className="p-3.5 text-center">
                      {f.filedDocumentUrl ? (
                        <button
                          type="button"
                          onClick={() => handlePreviewDoc(f)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#C59B27] hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold transition shadow-2xs cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Preview Doc</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlacierCard>

      {/* Global File Preview Modal */}
      <FilePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
        title={previewModal.title}
        subtitle={previewModal.subtitle}
        certNumber={previewModal.certNumber}
      />
    </div>
  );
};

export default RegistrationPage;
