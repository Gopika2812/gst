import React, { useState, useEffect } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import Badge from '../components/common/Badge';
import api from '../services/api';
import { Calculator, Download, Plus } from 'lucide-react';

const BookKeepingPage = () => {
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/filings', { params: { department: 'Book Keeping' } });
        setFilings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilings();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-[#0F2B48]">Book Keeping Workspace</h1>
        <p className="text-xs text-slate-500">Monthly Accounting, Bank Reconciliation, Cash Book, Sales/Purchase Entry & Financial Statements</p>
      </div>

      <GlacierCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-[#0F2B48] text-white">
              <tr>
                <th className="p-3.5 font-semibold">Client Name</th>
                <th className="p-3.5 font-semibold">Filing Period</th>
                <th className="p-3.5 font-semibold">Reconciliation Ref</th>
                <th className="p-3.5 font-semibold">Filed Date</th>
                <th className="p-3.5 font-semibold">Staff Responsible</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 text-center font-semibold">Financial Sheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading bookkeeping records...</td>
                </tr>
              ) : filings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No bookkeeping submissions logged</td>
                </tr>
              ) : (
                filings.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-800">{f.client?.clientName}</td>
                    <td className="p-3.5 font-semibold text-[#0F2B48]">{f.filingPeriod}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-700">{f.acknowledgementNumber || 'REC-PASSED'}</td>
                    <td className="p-3.5 text-slate-600">{new Date(f.filingDate).toLocaleDateString('en-IN')}</td>
                    <td className="p-3.5 font-medium text-slate-800">{f.filedBy?.name || 'Book Keeping Staff'}</td>
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
                          <span>View Sheet</span>
                        </a>
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
    </div>
  );
};

export default BookKeepingPage;
