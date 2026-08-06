import React, { useState, useEffect } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import Badge from '../components/common/Badge';
import InvoiceModal from '../components/billing/InvoiceModal';
import api from '../services/api';
import { Plus, Download, Mail, Share2, Printer, Search, CheckCircle2, RefreshCw } from 'lucide-react';

const BillingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const [invRes, clientRes] = await Promise.all([
        api.get('/invoices', { params: { search } }),
        api.get('/clients')
      ]);
      setInvoices(invRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [search]);

  const handleDownloadPDF = (invoiceId, invoiceNumber) => {
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  };

  const handleEmailInvoice = async (invoiceId) => {
    try {
      const res = await api.post(`/invoices/${invoiceId}/email`);
      alert(res.data.message);
    } catch (err) {
      alert('Failed to send email');
    }
  };

  const handleWhatsAppShare = async (invoiceId) => {
    try {
      const res = await api.get(`/invoices/${invoiceId}/whatsapp`);
      window.open(res.data.whatsappUrl, '_blank');
    } catch (err) {
      alert('Failed to generate WhatsApp link');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F2B48]">Billing & Invoicing (Module 3)</h1>
          <p className="text-xs text-slate-500">Auto invoice generation, PDF downloads, WhatsApp sharing & task workflow push</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-[#52A636] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#438A2B]"
        >
          <Plus className="h-4 w-4" />
          <span>Generate Tax Invoice</span>
        </button>
      </div>

      {/* Search Bar */}
      <GlacierCard className="p-3">
        <div className="flex w-full sm:w-80 items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Search className="mr-2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Invoice #, Client Name, Service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>
      </GlacierCard>

      {/* Invoices History Table */}
      <GlacierCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2B48] text-white">
              <tr>
                <th className="p-3.5 font-semibold">Invoice #</th>
                <th className="p-3.5 font-semibold">Date</th>
                <th className="p-3.5 font-semibold">Client Name</th>
                <th className="p-3.5 font-semibold">Service Type</th>
                <th className="p-3.5 font-semibold">Total (₹)</th>
                <th className="p-3.5 font-semibold">Paid (₹)</th>
                <th className="p-3.5 font-semibold">Pending (₹)</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Workflow</th>
                <th className="p-3.5 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">Loading invoices...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">No invoices generated yet</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold font-mono text-[#0F2B48]">{inv.invoiceNumber}</td>
                    <td className="p-3.5 text-slate-600">
                      {new Date(inv.invoiceDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">
                      {inv.client?.clientName || 'Valued Client'}
                    </td>
                    <td className="p-3.5 text-slate-600">{inv.serviceType}</td>
                    <td className="p-3.5 font-bold text-slate-800">₹{inv.total.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-semibold text-emerald-600">₹{inv.paidAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-semibold text-rose-600">₹{inv.pendingAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      <Badge status={inv.paymentStatus} />
                    </td>
                    <td className="p-3.5">
                      {inv.taskCreated ? (
                        <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Task Created
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)}
                          title="Download PDF Invoice"
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-[#0F2B48]"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEmailInvoice(inv._id)}
                          title="Email Invoice to Client"
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-[#0F2B48]"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleWhatsAppShare(inv._id)}
                          title="Share on WhatsApp"
                          className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                        >
                          <Share2 className="h-4 w-4" />
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

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchBillingData}
        clients={clients}
      />
    </div>
  );
};

export default BillingPage;
