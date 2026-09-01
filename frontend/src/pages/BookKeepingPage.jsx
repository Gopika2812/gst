import React, { useState, useEffect } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import Badge from '../components/common/Badge';
import api from '../services/api';
import {
  Calculator,
  Download,
  Upload,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Search,
  X
} from 'lucide-react';

const BookKeepingPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filings, setFilings] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForUpload, setSelectedTaskForUpload] = useState(null);

  const [formData, setFormData] = useState({
    client: '',
    filingPeriod: 'August 2026',
    acknowledgementNumber: '',
    remarks: ''
  });
  const [fileDoc, setFileDoc] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchBookKeepingData = async () => {
    setLoading(true);
    try {
      const [taskRes, filRes, clientRes] = await Promise.all([
        api.get('/tasks', { params: { department: 'Book Keeping' } }),
        api.get('/filings', { params: { department: 'Book Keeping' } }),
        api.get('/clients')
      ]);
      setTasks(taskRes.data);
      setFilings(filRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookKeepingData();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      fetchBookKeepingData();
    } catch (err) {
      alert('Failed to update task status');
      fetchBookKeepingData();
    }
  };

  const handleOpenUploadModal = (clientObj = null, taskObj = null) => {
    if (clientObj) {
      setFormData({
        client: clientObj._id || clientObj,
        filingPeriod: 'August 2026',
        acknowledgementNumber: '',
        remarks: taskObj ? `Accounting sheet for: ${taskObj.taskName}` : ''
      });
      setSelectedTaskForUpload(taskObj);
    } else {
      setFormData({
        client: '',
        filingPeriod: 'August 2026',
        acknowledgementNumber: '',
        remarks: ''
      });
      setSelectedTaskForUpload(null);
    }
    setFileDoc(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const data = new FormData();
      data.append('client', formData.client);
      data.append('department', 'Book Keeping');
      data.append('filingPeriod', formData.filingPeriod);
      data.append('acknowledgementNumber', formData.acknowledgementNumber);
      data.append('remarks', formData.remarks);
      if (fileDoc) data.append('filedDocument', fileDoc);

      await api.post('/filings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (selectedTaskForUpload) {
        await api.put(`/tasks/${selectedTaskForUpload._id}/status`, {
          status: 'Completed',
          remarks: `Accounting completed with ref: ${formData.acknowledgementNumber}`
        });
      }

      setIsModalOpen(false);
      fetchBookKeepingData();
    } catch (err) {
      alert('Failed to upload bookkeeping record');
    } finally {
      setUploading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      !search ||
      t.taskName?.toLowerCase().includes(search.toLowerCase()) ||
      t.client?.clientName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0A1E3F]">Book Keeping Workspace</h1>
          <p className="text-xs text-slate-500">
            Assigned Client Accounts Queue • Status Updates (<span className="font-semibold text-blue-600">Assigned</span> ➔ <span className="font-semibold text-amber-600">In Progress</span> ➔ <span className="font-semibold text-emerald-600">Completed</span>) • Upload Statements
          </p>
        </div>
        <button
          onClick={() => handleOpenUploadModal()}
          className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#C59B27] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#A68018] w-full sm:w-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Financial Sheet</span>
        </button>
      </div>

      {/* SECTION 1: ASSIGNED BOOKKEEPING TASKS */}
      <GlacierCard className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0A1E3F]">Active Bookkeeping & Accounts Queue</h3>
              <p className="text-[11px] text-slate-500">
                Assigned client accounting tasks ({filteredTasks.length} tasks)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs">
              <Search className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Client, Task..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-36 sm:w-48 bg-transparent text-xs outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#C59B27]"
            >
              <option value="">All Statuses</option>
              <option value="Assigned">Assigned (New)</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Can't Complete">Can't Complete</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-[#0A1E3F] text-white">
              <tr>
                <th className="p-3 font-semibold">Client Name</th>
                <th className="p-3 font-semibold">Service Type</th>
                <th className="p-3 font-semibold">Assigned Executive</th>
                <th className="p-3 font-semibold">Due Date</th>
                <th className="p-3 font-semibold">Priority</th>
                <th className="p-3 font-semibold">Process Status</th>
                <th className="p-3 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading assigned tasks...</td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No active Book Keeping tasks assigned yet.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== "Can't Complete";
                  return (
                    <tr key={t._id} className={`hover:bg-slate-50 transition ${isOverdue ? 'bg-rose-50/30' : ''}`}>
                      <td className="p-3 font-bold text-slate-800">
                        {t.client?.clientName || 'General Account Task'}
                      </td>
                      <td className="p-3 font-semibold text-[#0A1E3F]">{t.taskName}</td>
                      <td className="p-3 text-slate-700 font-medium">
                        {t.assignedEmployee?.name || 'Assigned Staff'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-slate-700">
                            {new Date(t.dueDate).toLocaleDateString('en-IN')}
                          </span>
                          {isOverdue && (
                            <span className="inline-flex items-center text-[9px] font-extrabold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                              <AlertTriangle className="mr-0.5 h-3 w-3" /> OVERDUE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                          t.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                          t.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t._id, e.target.value)}
                          className={`rounded-xl border px-2.5 py-1 text-xs font-bold outline-none cursor-pointer transition ${
                            t.status === 'Completed' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' :
                            t.status === 'In Progress' ? 'border-blue-300 bg-blue-50 text-blue-800' :
                            t.status === "Can't Complete" ? 'border-rose-300 bg-rose-50 text-rose-800' :
                            'border-amber-300 bg-amber-50 text-amber-800'
                          }`}
                        >
                          <option value="Assigned">Assigned (New)</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Can't Complete">Can't Complete</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        {t.status !== 'Completed' ? (
                          <button
                            onClick={() => handleOpenUploadModal(t.client, t)}
                            title="Upload Sheet & Mark Completed"
                            className="inline-flex items-center space-x-1 rounded-lg bg-[#C59B27] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-[#A68018] transition cursor-pointer"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload Sheet</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlacierCard>

      {/* SECTION 2: SUBMITTED BOOKKEEPING RECORDS */}
      <GlacierCard title="Book Keeping Submissions History" subtitle="Reconciliation references & financial statements" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-[#0A1E3F] text-white">
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
                    <td className="p-3.5 font-semibold text-[#0A1E3F]">{f.filingPeriod}</td>
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
                          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#C59B27] hover:underline"
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
