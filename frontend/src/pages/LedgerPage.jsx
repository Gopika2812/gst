import React, { useState, useEffect } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import api from '../services/api';
import { BookOpen, Plus, Printer, Download, CreditCard, ArrowDownRight, ArrowUpRight } from 'lucide-react';

const LedgerPage = () => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [txData, setTxData] = useState({
    transactionType: 'Payment Received',
    referenceNumber: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/clients');
        setClients(res.data);
        if (res.data.length > 0) {
          setSelectedClientId(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClients();
  }, []);

  const fetchLedger = async (clientId) => {
    if (!clientId) return;
    setLoading(true);
    try {
      const res = await api.get(`/ledgers/client/${clientId}`);
      setLedgerData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClientId) {
      fetchLedger(selectedClientId);
    }
  }, [selectedClientId]);

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ledgers/transaction', {
        client: selectedClientId,
        ...txData
      });
      setIsTransactionModalOpen(false);
      fetchLedger(selectedClientId);
    } catch (err) {
      alert('Failed to record transaction');
    }
  };

  const clientInfo = ledgerData?.client;
  const entries = ledgerData?.entries || [];

  return (
    <div className="space-y-6">
      {/* Header & Client Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F2B48]">Client Ledger & Financial Statement (Module 4)</h1>
          <p className="text-xs text-slate-500">Track running balances, payments received, credit & debit notes</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-[#0F2B48] shadow-xs outline-none focus:border-[#52A636]"
          >
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.clientName} ({c.gstin || c.pan || 'Active'})
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsTransactionModalOpen(true)}
            className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#52A636] px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#438A2B] w-full sm:w-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Client Financial Summary Cards */}
      {clientInfo && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Opening Balance"
            value={`₹${(ledgerData.openingBalance || 0).toLocaleString('en-IN')}`}
            color="navy"
          />
          <StatCard
            title="Total Invoiced (Debit)"
            value={`₹${(ledgerData.totalDebit || 0).toLocaleString('en-IN')}`}
            color="blue"
          />
          <StatCard
            title="Total Payments (Credit)"
            value={`₹${(ledgerData.totalCredit || 0).toLocaleString('en-IN')}`}
            color="green"
          />
          <StatCard
            title="Closing Outstanding"
            value={`₹${(ledgerData.closingBalance || 0).toLocaleString('en-IN')}`}
            color="amber"
          />
        </div>
      )}

      {/* Ledger Entries Table */}
      <GlacierCard className="p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm">Statement of Account: {clientInfo?.clientName}</h3>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1 text-xs font-semibold text-[#0F2B48] hover:underline"
          >
            <Printer className="h-4 w-4" />
            <span>Print Ledger</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-[#0F2B48] text-white">
              <tr>
                <th className="p-3.5 font-semibold">Date</th>
                <th className="p-3.5 font-semibold">Transaction Type</th>
                <th className="p-3.5 font-semibold">Reference #</th>
                <th className="p-3.5 font-semibold">Description</th>
                <th className="p-3.5 font-semibold text-right">Debit (₹)</th>
                <th className="p-3.5 font-semibold text-right">Credit (₹)</th>
                <th className="p-3.5 font-semibold text-right">Running Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading ledger statement...</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No transactions recorded</td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50">
                    <td className="p-3.5 text-slate-600">
                      {new Date(e.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <Badge status={e.transactionType} />
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-800">{e.referenceNumber || '-'}</td>
                    <td className="p-3.5 text-slate-600">{e.description}</td>
                    <td className="p-3.5 text-right font-semibold text-rose-600">
                      {e.debit > 0 ? `₹${e.debit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-emerald-600">
                      {e.credit > 0 ? `₹${e.credit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="p-3.5 text-right font-bold text-[#0F2B48]">
                      ₹{e.runningBalance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlacierCard>

      {/* Record Payment Modal */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#0F2B48]">Record Payment / Ledger Entry</h3>
            <p className="text-xs text-slate-500 mt-0.5">Client: {clientInfo?.clientName}</p>

            <form onSubmit={handleTransactionSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Transaction Type</label>
                <select
                  value={txData.transactionType}
                  onChange={(e) => setTxData({ ...txData, transactionType: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none"
                >
                  <option>Payment Received</option>
                  <option>Credit Note</option>
                  <option>Debit Note</option>
                  <option>Invoice</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={txData.amount}
                  onChange={(e) => setTxData({ ...txData, amount: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Reference Number (UPI / Cheque #)</label>
                <input
                  type="text"
                  value={txData.referenceNumber}
                  onChange={(e) => setTxData({ ...txData, referenceNumber: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Description</label>
                <textarea
                  rows={2}
                  value={txData.description}
                  onChange={(e) => setTxData({ ...txData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTransactionModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#52A636] px-4 py-2 font-semibold text-white hover:bg-[#438A2B]"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerPage;
