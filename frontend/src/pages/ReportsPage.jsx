import React, { useState, useEffect, useMemo } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import api from '../services/api';
import { exportToCSV } from '../utils/exportUtils';
import {
  BarChart3,
  Download,
  Printer,
  Users,
  Award,
  Receipt,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  DollarSign,
  Briefcase,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  PieChart,
  FileSpreadsheet
} from 'lucide-react';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('services_turnover'); // default to services turnover or employee
  const [loading, setLoading] = useState(true);

  // Data states
  const [performanceData, setPerformanceData] = useState([]);
  const [servicesReport, setServicesReport] = useState({ summary: {}, services: [], invoices: [] });
  const [invoicesData, setInvoicesData] = useState([]);

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [perfRes, srvRes, billRes] = await Promise.all([
        api.get('/reports/employee-performance').catch(() => ({ data: [] })),
        api.get('/reports/services-turnover', {
          params: {
            startDate: startDate || undefined,
            endDate: endDate || undefined
          }
        }).catch(() => ({ data: { summary: {}, services: [], invoices: [] } })),
        api.get('/reports/billing').catch(() => ({ data: [] }))
      ]);

      setPerformanceData(perfRes.data || []);
      setServicesReport(srvRes.data || { summary: {}, services: [], invoices: [] });
      setInvoicesData(billRes.data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, [startDate, endDate]);

  const handleDatePreset = (preset) => {
    setDateFilter(preset);
    const now = new Date();
    if (preset === 'All Time') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'This Month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(first);
      setEndDate(last);
    } else if (preset === 'This Year') {
      const first = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const last = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      setStartDate(first);
      setEndDate(last);
    }
  };

  // Filtered Services
  const filteredServices = useMemo(() => {
    const list = servicesReport.services || [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (s) =>
        s.serviceName.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q)
    );
  }, [servicesReport.services, search]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    const list = invoicesData || [];
    return list.filter((inv) => {
      const matchSearch =
        !search ||
        inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
        inv.client?.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        inv.serviceType?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || inv.paymentStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoicesData, search, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    if (activeTab === 'employee') {
      const headers = {
        'employee.name': 'Employee Name',
        'employee.department': 'Department',
        'employee.role': 'Role',
        assigned: 'Assigned Tasks',
        completed: 'Completed Tasks',
        pending: 'Pending Tasks',
        overdue: 'Overdue Tasks',
        completionRate: 'Completion Rate %'
      };
      exportToCSV('RoyalAccounting_Employee_Performance', performanceData, headers);
    } else if (activeTab === 'services_turnover') {
      const headers = {
        serviceName: 'Service Name',
        department: 'Department',
        invoiceCount: 'Invoices Issued',
        clientCount: 'Active Clients',
        billedTurnover: 'Billed Turnover (₹)',
        collectedAmount: 'Collected Revenue (₹)',
        outstandingAmount: 'Outstanding (₹)',
        collectionRate: 'Collection Rate %',
        turnoverShare: 'Turnover Share %'
      };
      exportToCSV('RoyalAccounting_Services_Turnover_Report', filteredServices, headers);
    } else if (activeTab === 'revenue') {
      const headers = {
        invoiceNumber: 'Invoice #',
        'client.clientName': 'Client Name',
        'client.gstin': 'GSTIN',
        serviceType: 'Service Type',
        total: 'Total Amount (₹)',
        paidAmount: 'Paid Amount (₹)',
        pendingAmount: 'Outstanding Amount (₹)',
        paymentStatus: 'Status',
        paymentMode: 'Payment Mode',
        invoiceDate: 'Invoice Date'
      };
      exportToCSV('RoyalAccounting_Revenue_Outstanding_Report', filteredInvoices, headers);
    }
  };

  const turnoverSummary = servicesReport.summary || {};

  return (
    <div className="space-y-6">
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#52A636]/10 text-[#52A636]">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#0A1E3F]">Reports & Business Intelligence</h1>
              <p className="text-xs text-slate-500">
                Service-based turnover analytics, revenue performance & staff productivity matrix
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none justify-center flex items-center space-x-1.5 rounded-xl bg-[#0A1E3F] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1A3A5E] transition cursor-pointer"
          >
            <Download className="h-4 w-4 text-[#52A636]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none justify-center flex items-center space-x-1.5 rounded-xl bg-[#52A636] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#438A2B] transition cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 sm:space-x-2 rounded-2xl bg-slate-200/70 p-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'services_turnover', name: 'Services Turnover Report', icon: Briefcase },
          { id: 'revenue', name: 'Revenue & Outstanding', icon: Receipt },
          { id: 'employee', name: 'Employee Performance', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearch('');
              }}
              className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-white text-[#0A1E3F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[#52A636]' : 'text-slate-400'}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SERVICES TURNOVER REPORT */}
      {activeTab === 'services_turnover' && (
        <div className="space-y-6">
          {/* Turnover Top KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Service Turnover"
              value={`₹${(turnoverSummary.totalFirmTurnover || 0).toLocaleString('en-IN')}`}
              icon={TrendingUp}
              color="navy"
              subtitle={`From ${turnoverSummary.totalInvoices || 0} total invoices`}
            />
            <StatCard
              title="Collected Revenue"
              value={`₹${(turnoverSummary.totalFirmCollected || 0).toLocaleString('en-IN')}`}
              icon={CheckCircle2}
              color="green"
              trend={`${turnoverSummary.overallCollectionRate || 0}% Realized`}
              subtitle="Paid turnover"
            />
            <StatCard
              title="Outstanding Turnover"
              value={`₹${(turnoverSummary.totalFirmOutstanding || 0).toLocaleString('en-IN')}`}
              icon={AlertTriangle}
              color="amber"
              subtitle="Pending collection"
            />
            <StatCard
              title="Services Offered"
              value={turnoverSummary.totalServicesOffered || 0}
              icon={Briefcase}
              color="blue"
              subtitle="Revenue generating categories"
            />
          </div>

          {/* Filter & Period Bar */}
          <GlacierCard className="p-3.5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Presets */}
              <div className="flex items-center space-x-1 rounded-xl bg-slate-100 p-1 overflow-x-auto no-scrollbar">
                {['All Time', 'This Month', 'This Year'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleDatePreset(preset)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      dateFilter === preset
                        ? 'bg-white text-[#0A1E3F] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Date Pickers */}
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-bold text-slate-500">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDateFilter('Custom');
                    }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#52A636]"
                  />
                </div>
                <span className="text-xs text-slate-400 font-bold">➔</span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-bold text-slate-500">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDateFilter('Custom');
                    }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#52A636]"
                  />
                </div>
              </div>

              {/* Search */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 w-full sm:w-64">
                <Search className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search service name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-xs outline-none text-slate-800"
                />
              </div>
            </div>
          </GlacierCard>

          {/* Services Turnover Matrix Table */}
          <GlacierCard className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Service-Wise Turnover & Collection Breakdown</h3>
                <p className="text-xs text-slate-400">Total revenue generated grouped by service category</p>
              </div>
              <span className="rounded-full bg-[#0A1E3F] text-white px-2.5 py-0.5 text-xs font-bold">
                {filteredServices.length} Services
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-[#0A1E3F] text-white">
                  <tr>
                    <th className="p-3.5 font-semibold">Service Name & Category</th>
                    <th className="p-3.5 font-semibold">Department</th>
                    <th className="p-3.5 font-semibold text-center">Invoices</th>
                    <th className="p-3.5 font-semibold text-center">Clients</th>
                    <th className="p-3.5 font-semibold text-right">Billed Turnover</th>
                    <th className="p-3.5 font-semibold text-right">Collected (Paid)</th>
                    <th className="p-3.5 font-semibold text-right">Outstanding</th>
                    <th className="p-3.5 font-semibold text-center">Collection Rate</th>
                    <th className="p-3.5 font-semibold text-center">Turnover Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        Calculating service turnover metrics...
                      </td>
                    </tr>
                  ) : filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No service turnover records found
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((srv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-bold text-slate-800">
                          <div className="flex items-center space-x-2">
                            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-[#52A636] flex items-center justify-center font-bold text-xs shrink-0">
                              {idx + 1}
                            </div>
                            <span className="text-[#0A1E3F] font-bold">{srv.serviceName}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-[10px]">
                            {srv.department || 'General'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-800">{srv.invoiceCount}</td>
                        <td className="p-3.5 text-center font-bold text-slate-700">{srv.clientCount}</td>
                        <td className="p-3.5 text-right font-extrabold text-[#0A1E3F]">
                          ₹{srv.billedTurnover.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-bold text-emerald-600">
                          ₹{srv.collectedAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-bold text-rose-600">
                          ₹{srv.outstandingAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-[#52A636] h-full"
                                style={{ width: `${Math.min(100, srv.collectionRate)}%` }}
                              />
                            </div>
                            <span className="font-extrabold text-[#52A636] text-[11px]">
                              {srv.collectionRate}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                            {srv.turnoverShare}% Share
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredServices.length > 0 && (
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
                    <tr>
                      <td colSpan={2} className="p-3.5 text-slate-800 font-extrabold uppercase">
                        Total Firm Turnover
                      </td>
                      <td className="p-3.5 text-center">{turnoverSummary.totalInvoices || 0}</td>
                      <td className="p-3.5 text-center">-</td>
                      <td className="p-3.5 text-right font-extrabold text-[#0A1E3F]">
                        ₹{(turnoverSummary.totalFirmTurnover || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-emerald-600">
                        ₹{(turnoverSummary.totalFirmCollected || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-rose-600">
                        ₹{(turnoverSummary.totalFirmOutstanding || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-center font-extrabold text-[#52A636]">
                        {turnoverSummary.overallCollectionRate || 0}%
                      </td>
                      <td className="p-3.5 text-center font-extrabold text-blue-800">100%</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </GlacierCard>
        </div>
      )}

      {/* TAB 2: REVENUE & OUTSTANDING */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Invoiced Revenue"
              value={`₹${(turnoverSummary.totalFirmTurnover || 0).toLocaleString('en-IN')}`}
              icon={Receipt}
              color="navy"
              subtitle="All billed invoices"
            />
            <StatCard
              title="Total Collected"
              value={`₹${(turnoverSummary.totalFirmCollected || 0).toLocaleString('en-IN')}`}
              icon={CheckCircle2}
              color="green"
              subtitle="Realized receipts"
            />
            <StatCard
              title="Total Outstanding"
              value={`₹${(turnoverSummary.totalFirmOutstanding || 0).toLocaleString('en-IN')}`}
              icon={AlertTriangle}
              color="rose"
              subtitle="Pending customer balance"
            />
          </div>

          <GlacierCard className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex w-full sm:w-72 items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Search className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by invoice #, client, service..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-xs outline-none text-slate-800"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            </div>
          </GlacierCard>

          <GlacierCard className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Invoice-Wise Revenue & Outstanding Ledger</h3>
              <span className="rounded-full bg-[#0A1E3F] text-white px-2.5 py-0.5 text-xs font-bold">
                {filteredInvoices.length} Invoices
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-[#0A1E3F] text-white">
                  <tr>
                    <th className="p-3.5 font-semibold">Invoice #</th>
                    <th className="p-3.5 font-semibold">Client Name</th>
                    <th className="p-3.5 font-semibold">Service Type</th>
                    <th className="p-3.5 font-semibold">Date</th>
                    <th className="p-3.5 font-semibold text-right">Total (₹)</th>
                    <th className="p-3.5 font-semibold text-right">Paid (₹)</th>
                    <th className="p-3.5 font-semibold text-right">Pending (₹)</th>
                    <th className="p-3.5 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">Loading invoice records...</td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">No invoices match criteria</td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono font-bold text-[#0A1E3F]">{inv.invoiceNumber}</td>
                        <td className="p-3.5 font-bold text-slate-800">{inv.client?.clientName || 'Valued Client'}</td>
                        <td className="p-3.5 text-slate-600">{inv.serviceType}</td>
                        <td className="p-3.5 text-slate-600">
                          {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-IN') : '-'}
                        </td>
                        <td className="p-3.5 text-right font-extrabold text-[#0A1E3F]">
                          ₹{(inv.total || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-bold text-emerald-600">
                          ₹{(inv.paidAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-bold text-rose-600">
                          ₹{(inv.pendingAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.paymentStatus === 'Partial'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlacierCard>
        </div>
      )}

      {/* TAB 3: EMPLOYEE PERFORMANCE */}
      {activeTab === 'employee' && (
        <GlacierCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Staff Productivity & Task Completion Rate</h3>
            <span className="rounded-full bg-[#0A1E3F] text-white px-2.5 py-0.5 text-xs font-bold">
              {performanceData.length} Staff Members
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-[#0A1E3F] text-white">
                <tr>
                  <th className="p-3.5 font-semibold">Employee Name</th>
                  <th className="p-3.5 font-semibold">Role & Department</th>
                  <th className="p-3.5 font-semibold text-center">Assigned Tasks</th>
                  <th className="p-3.5 font-semibold text-center">Completed</th>
                  <th className="p-3.5 font-semibold text-center">Pending</th>
                  <th className="p-3.5 font-semibold text-center">Overdue</th>
                  <th className="p-3.5 font-semibold text-center">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">Loading performance data...</td>
                  </tr>
                ) : (
                  performanceData.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-800">{p.employee?.name}</td>
                      <td className="p-3.5 text-slate-600">
                        {p.employee?.role} ({p.employee?.department})
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800">{p.assigned}</td>
                      <td className="p-3.5 text-center font-bold text-emerald-600">{p.completed}</td>
                      <td className="p-3.5 text-center font-bold text-amber-600">{p.pending}</td>
                      <td className="p-3.5 text-center font-bold text-rose-600">{p.overdue}</td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#52A636] h-full"
                              style={{ width: `${p.completionRate}%` }}
                            />
                          </div>
                          <span className="font-extrabold text-[#52A636] text-xs">{p.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlacierCard>
      )}
    </div>
  );
};

export default ReportsPage;
