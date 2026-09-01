import React, { useState, useEffect, useMemo } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import Badge from '../components/common/Badge';
import InvoiceModal from '../components/billing/InvoiceModal';
import AssignTaskModal from '../components/billing/AssignTaskModal';
import { SortableHeader, sortTableData } from '../components/common/SortableHeader';
import api from '../services/api';
import { Plus, Download, Mail, Share2, Printer, Search, CheckCircle2, RefreshCw, UserPlus, UserCheck, Edit3 } from 'lucide-react';

const formatInvoiceNumber = (num) => {
  if (!num) return 'INV00126';
  if (/^INV\d{5}$/.test(num)) return num;
  const match = num.match(/INV-(\d{4})-(\d+)/);
  if (match) {
    const year = match[1].slice(-2);
    const counter = String(match[2]).padStart(3, '0');
    return `INV${counter}${year}`;
  }
  return num;
};

const BillingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'invoiceDate', direction: 'desc' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedInvoiceForAssign, setSelectedInvoiceForAssign] = useState(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState(null);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const [invRes, clientRes, userRes] = await Promise.all([
        api.get('/invoices', { params: { search } }),
        api.get('/clients'),
        api.get('/users')
      ]);
      setInvoices(invRes.data);
      setClients(clientRes.data);
      setEmployees(userRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [search]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedInvoices = useMemo(() => {
    return sortTableData(invoices, sortConfig);
  }, [invoices, sortConfig]);

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceNumber || 'download'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download invoice PDF');
    }
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

  const handleOpenAssignModal = (invoice) => {
    setSelectedInvoiceForAssign(invoice);
    setIsAssignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0A1E3F]">Billing & Invoicing (Module 3)</h1>
          <p className="text-xs text-slate-500">Auto invoice generation, PDF downloads, WhatsApp sharing & task workflow push</p>
        </div>
        <button
          onClick={() => {
            setSelectedInvoiceForEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#C59B27] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#A68018] w-full sm:w-auto cursor-pointer"
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
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-[#0A1E3F] text-white">
              <tr>
                <SortableHeader label="Invoice #" sortKey="invoiceNumber" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Date" sortKey="invoiceDate" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Client Name" sortKey="client.clientName" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Service Type" sortKey="serviceType" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Total (₹)" sortKey="total" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Paid (₹)" sortKey="paidAmount" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Pending (₹)" sortKey="pendingAmount" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Status" sortKey="paymentStatus" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Workflow / Executive" sortKey="assignedEmployee.name" currentSort={sortConfig} onSort={handleSort} />
                <th className="p-3.5 text-center font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">Loading invoices...</td>
                </tr>
              ) : sortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">No invoices generated yet</td>
                </tr>
              ) : (
                sortedInvoices.map((inv) => {
                  const displayInvNo = formatInvoiceNumber(inv.invoiceNumber);
                  return (
                    <tr key={inv._id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold font-mono text-[#0A1E3F]">{displayInvNo}</td>
                      <td className="p-3.5 text-slate-600">
                        {new Date(inv.invoiceDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">
                        {inv.client?.clientName || 'Valued Client'}
                      </td>
                      <td className="p-3.5 text-slate-700">
                        <div className="font-semibold text-slate-800">{inv.serviceType}</div>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.billingCycle === 'Yearly'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : inv.billingCycle === 'One-Time'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {inv.billingCycle || 'Monthly'} Plan
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">₹{inv.total.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 font-semibold text-emerald-600">₹{inv.paidAmount.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 font-semibold text-rose-600">₹{inv.pendingAmount.toLocaleString('en-IN')}</td>
                      <td className="p-3.5">
                        <Badge status={inv.paymentStatus} />
                      </td>
                      <td className="p-3.5">
                        {inv.taskCreated ? (
                          <div className="flex flex-col space-y-1">
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 w-fit shadow-2xs">
                              <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                              {inv.assignedEmployee?.name ? `Assigned: ${inv.assignedEmployee.name}` : 'Task Assigned'}
                            </span>
                            <button
                              onClick={() => handleOpenAssignModal(inv)}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 text-left hover:underline cursor-pointer"
                            >
                              Reassign Staff ➔
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAssignModal(inv)}
                            className="inline-flex items-center text-[11px] font-bold text-white bg-[#C59B27] hover:bg-[#A68018] px-3 py-1.5 rounded-xl shadow-xs transition transform active:scale-95 cursor-pointer"
                            title="Assign this client to executive & respective department"
                          >
                            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                            Assign Executive
                          </button>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedInvoiceForEdit(inv);
                              setIsModalOpen(true);
                            }}
                            title="Edit Tax Invoice Details"
                            className="rounded-lg p-1.5 text-amber-700 bg-amber-50 hover:bg-[#C59B27] hover:text-white transition shadow-2xs cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenAssignModal(inv)}
                            title="Assign Client to Department & Executive"
                            className="rounded-lg p-1.5 text-emerald-700 bg-emerald-50 hover:bg-[#C59B27] hover:text-white transition shadow-2xs cursor-pointer"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(inv._id, displayInvNo)}
                            title="Download Official PDF Invoice"
                            className="rounded-lg p-1.5 text-slate-700 bg-slate-100 hover:bg-[#0A1E3F] hover:text-white transition shadow-2xs cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleWhatsAppShare(inv._id)}
                            title="Share on WhatsApp"
                            className="rounded-lg p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition shadow-2xs cursor-pointer"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlacierCard>

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInvoiceForEdit(null);
        }}
        onRefresh={fetchBillingData}
        clients={clients}
        employees={employees}
        invoice={selectedInvoiceForEdit}
      />

      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        invoice={selectedInvoiceForAssign}
        onRefresh={fetchBillingData}
        employees={employees}
      />
    </div>
  );
};

export default BillingPage;
