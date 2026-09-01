import React, { useState, useEffect } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { printClientLedger } from '../utils/exportUtils';
import { BookOpen, Plus, Printer, Download, CreditCard, ArrowDownRight, ArrowUpRight, Edit3, Trash2, X } from 'lucide-react';

const LedgerPage = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [txData, setTxData] = useState({
    transactionType: 'Payment Received',
    referenceNumber: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [formError, setFormError] = useState('');

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

  const handleOpenCreateModal = () => {
    setEditingTransaction(null);
    setTxData({
      transactionType: 'Payment Received',
      referenceNumber: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setIsTransactionModalOpen(true);
  };

  const handleOpenEditModal = (entry) => {
    setEditingTransaction(entry);
    setTxData({
      transactionType: entry.transactionType,
      referenceNumber: entry.referenceNumber || '',
      amount: entry.credit || entry.debit || '',
      description: entry.description || '',
      date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFormError('');

    try {
      if (editingTransaction) {
        await api.put(`/ledgers/transaction/${editingTransaction._id}`, txData);
      } else {
        await api.post('/ledgers/transaction', {
          client: selectedClientId,
          ...txData
        });
      }
      setIsTransactionModalOpen(false);
      fetchLedger(selectedClientId);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to record transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (entry) => {
    if (window.confirm(`Are you sure you want to remove this ${entry.transactionType} entry (₹${(entry.credit || entry.debit)?.toLocaleString('en-IN')})? This will automatically recalculate the client's balance.`)) {
      try {
        await api.delete(`/ledgers/transaction/${entry._id}`);
        fetchLedger(selectedClientId);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove transaction');
      }
    }
  };

  const handlePrintLedger = () => {
    if (!ledgerData) {
      alert('Ledger data is not ready to print.');
      return;
    }
    printClientLedger({
      ledgerData,
      client: clientInfo,
      user
    });
  };

  const clientInfo = ledgerData?.client;
  const entries = ledgerData?.entries || [];

  return (
    <div className="space-y-6">
      {/* Header & Client Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0A1E3F]">Client Ledger & Financial Statement (Module 4)</h1>
          <p className="text-xs text-slate-500">Track running balances, payments received, credit & debit notes</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-[#0A1E3F] shadow-xs outline-none focus:border-[#C59B27] cursor-pointer"
          >
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.clientName} ({c.gstin || c.pan || 'Active'})
              </option>
            ))}
          </select>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#C59B27] px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#A68018] w-full sm:w-auto shrink-0 cursor-pointer"
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
            onClick={handlePrintLedger}
            className="flex items-center space-x-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#0A1E3F] hover:bg-[#0A1E3F] hover:text-white transition shadow-2xs cursor-pointer"
          >
            <Printer className="h-4 w-4 text-[#C59B27]" />
            <span>Print Official Ledger</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-[#0A1E3F] text-white">
              <tr>
                <th className="p-3.5 font-semibold">Date</th>
                <th className="p-3.5 font-semibold">Transaction Type</th>
                <th className="p-3.5 font-semibold">Reference #</th>
                <th className="p-3.5 font-semibold">Description</th>
                <th className="p-3.5 font-semibold text-right">Debit (₹)</th>
                <th className="p-3.5 font-semibold text-right">Credit (₹)</th>
                <th className="p-3.5 font-semibold text-right">Running Balance (₹)</th>
                <th className="p-3.5 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading ledger statement...</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No transactions recorded</td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50 transition">
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
                    <td className="p-3.5 text-right font-bold text-[#0A1E3F]">
                      ₹{e.runningBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(e)}
                          title="Edit Transaction Entry"
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-amber-50 hover:text-[#C59B27] transition cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(e)}
                          title="Remove Transaction Entry"
                          className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlacierCard>

      {/* Record / Edit Payment Modal */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0A1E3F]">
                  {editingTransaction ? 'Edit Ledger / Payment Entry' : 'Record Payment / Ledger Entry'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Client: {clientInfo?.clientName}</p>
              </div>
              <button
                onClick={() => setIsTransactionModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs font-semibold text-rose-600 border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleTransactionSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Transaction Type</label>
                <select
                  value={txData.transactionType}
                  onChange={(e) => setTxData({ ...txData, transactionType: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none focus:border-[#C59B27]"
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
                  placeholder="Enter amount (e.g. 500)"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Reference Number (UPI / Cheque / Ref #)</label>
                <input
                  type="text"
                  value={txData.referenceNumber}
                  onChange={(e) => setTxData({ ...txData, referenceNumber: e.target.value })}
                  placeholder="e.g. UPI-9834729384"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Transaction Date</label>
                <input
                  type="date"
                  value={txData.date}
                  onChange={(e) => setTxData({ ...txData, date: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Description</label>
                <textarea
                  rows={2}
                  value={txData.description}
                  onChange={(e) => setTxData({ ...txData, description: e.target.value })}
                  placeholder="Optional remarks or service details..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none focus:border-[#C59B27]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransactionModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#C59B27] px-4 py-2 font-semibold text-white hover:bg-[#A68018] cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingTransaction ? 'Update Entry' : 'Save Transaction'}
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
