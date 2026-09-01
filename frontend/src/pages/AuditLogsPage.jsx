import React, { useState, useEffect } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import Badge from '../components/common/Badge';
import api from '../services/api';
import { ShieldAlert, Search, Filter } from 'lucide-react';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audits', { params: { search, module: moduleFilter } });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, moduleFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-[#0A1E3F]">System Audit Trail Logs</h1>
        <p className="text-xs text-slate-500">Comprehensive security audit logger tracking all mutations, logins, permissions & task actions</p>
      </div>

      {/* Filter Bar */}
      <GlacierCard className="p-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex w-full sm:w-80 items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Search className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search User Name, Action, Details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="">All System Modules</option>
              <option value="Authentication">Authentication</option>
              <option value="Clients">Clients</option>
              <option value="Billing">Billing</option>
              <option value="Task Board">Task Board</option>
              <option value="User Management">User Management</option>
              <option value="Certification">Certification</option>
              <option value="Settings">Settings</option>
            </select>
          </div>
        </div>
      </GlacierCard>

      {/* Audit Log Table */}
      <GlacierCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-[#0A1E3F] text-white">
              <tr>
                <th className="p-3.5 font-semibold">Timestamp</th>
                <th className="p-3.5 font-semibold">User Name & Role</th>
                <th className="p-3.5 font-semibold">Action</th>
                <th className="p-3.5 font-semibold">Module</th>
                <th className="p-3.5 font-semibold">Activity Details</th>
                <th className="p-3.5 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading audit trail records...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No audit log records found</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50">
                    <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{log.userName}</p>
                      <span className="text-[10px] text-slate-500 font-medium">{log.userRole}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-[#0A1E3F]">{log.action}</td>
                    <td className="p-3.5">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 text-[10px]">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{log.details || '-'}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">{log.ipAddress}</td>
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

export default AuditLogsPage;
