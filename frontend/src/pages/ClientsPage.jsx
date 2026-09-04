import React, { useState, useEffect, useMemo } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import Badge from '../components/common/Badge';
import ClientModal from '../components/clients/ClientModal';
import { SortableHeader, sortTableData } from '../components/common/SortableHeader';
import api from '../services/api';
import { Plus, Search, Filter, ShieldAlert, FileText, Phone, Mail, Edit3, Power, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ClientsPage = () => {
  const { user, hasPermission } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const canDeleteClient = isSuperAdmin || (hasPermission && hasPermission('Clients', 'delete'));

  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'clientName', direction: 'asc' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const [clientRes, userRes] = await Promise.all([
        api.get('/clients', { params: { search, status: statusFilter } }),
        api.get('/users')
      ]);
      setClients(clientRes.data);
      setEmployees(userRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter]);

  const handleToggleStatus = async (clientId) => {
    try {
      await api.put(`/clients/${clientId}/toggle-status`);
      fetchClients();
    } catch (err) {
      alert('Failed to update client status');
    }
  };

  const handleDeleteClient = async (clientId, clientName, clientCode) => {
    const confirmMsg = `Are you sure you want to permanently delete client "${clientName}" (${clientCode || 'N/A'})?\n\nThis will also delete all associated certifications, ledgers, and task records for this client. This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(clientId);
    try {
      await api.delete(`/clients/${clientId}`);
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete client');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedClients = useMemo(() => {
    return sortTableData(clients, sortConfig);
  }, [clients, sortConfig]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0A1E3F]">Client Management & Registration (Module 1)</h1>
          <p className="text-xs text-slate-500">Manage client profiles, tax information, credit limits & document records</p>
        </div>
        <button
          onClick={() => {
            setSelectedClientForEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#52A636] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#438A2B] w-full sm:w-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Client</span>
        </button>
      </div>

      {/* Filter Bar */}
      <GlacierCard className="p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex w-full sm:w-80 items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Search className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search Client Name, Trade Name, PAN, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </GlacierCard>

      {/* Clients Table */}
      <GlacierCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-[#0A1E3F] text-white">
              <tr>
                <SortableHeader label="Client Code / Name" sortKey="clientName" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Trade Name & Type" sortKey="tradeName" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="PAN & GSTIN" sortKey="gstin" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Responsible Staff" sortKey="responsibleEmployee.name" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Credit Limit" sortKey="creditLimit" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Closing Bal" sortKey="closingBalance" currentSort={sortConfig} onSort={handleSort} />
                <SortableHeader label="Status" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                <th className="p-3.5 text-center font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading clients...</td>
                </tr>
              ) : sortedClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No client records found</td>
                </tr>
              ) : (
                sortedClients.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{c.clientName}</p>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold text-[#0A1E3F] bg-slate-100 px-1.5 py-0.5 rounded">
                          {c.clientCode}
                        </span>
                        {c.noCertificateRequired && (
                          <span className="text-[9px] font-extrabold text-[#52A636] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Direct Billing
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="font-medium text-slate-700">{c.tradeName || 'N/A'}</p>
                      <span className="text-[10px] text-slate-500">{c.clientType}</span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-mono text-[11px] font-semibold text-slate-800">GST: {c.gstin || 'N/A'}</p>
                      <p className="font-mono text-[10px] text-slate-500">PAN: {c.pan || 'N/A'}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-medium text-slate-800">{c.responsibleEmployee?.name || 'Unassigned'}</p>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      ₹{c.creditLimit?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-bold text-[#52A636]">
                      ₹{c.closingBalance?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <Badge status={c.status} />
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedClientForEdit(c);
                            setIsModalOpen(true);
                          }}
                          title="Edit Client Profile & Services"
                          className="rounded-lg p-1.5 text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-[#52A636] transition cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c._id)}
                          title={c.status === 'Active' ? 'Deactivate Client (Halts future recurring tasks)' : 'Reactivate Client'}
                          className={`rounded-lg p-1.5 text-xs font-semibold transition cursor-pointer ${
                            c.status === 'Active' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        {canDeleteClient && (
                          <button
                            onClick={() => handleDeleteClient(c._id, c.clientName, c.clientCode)}
                            disabled={deletingId === c._id}
                            title="Delete Client Record Permanently"
                            className="rounded-lg p-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === c._id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlacierCard>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClientForEdit(null);
        }}
        onRefresh={fetchClients}
        employees={employees}
        client={selectedClientForEdit}
      />
    </div>
  );
};

export default ClientsPage;
