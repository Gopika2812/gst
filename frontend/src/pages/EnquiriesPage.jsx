import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GlacierCard from '../components/common/GlacierCard';
import StatCard from '../components/common/StatCard';
import EnquiryModal from '../components/enquiries/EnquiryModal';
import ConvertToTaskModal from '../components/enquiries/ConvertToTaskModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Contact2,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRightCircle,
  Tag,
  Edit2,
  Trash2,
  User,
  KanbanSquare,
  Sparkles,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

const EnquiriesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal States
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [selectedEnquiryForEdit, setSelectedEnquiryForEdit] = useState(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedEnquiryForConvert, setSelectedEnquiryForConvert] = useState(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const [enquiryRes, userRes] = await Promise.all([
        api.get('/enquiries', {
          params: {
            status: statusFilter !== 'All' ? statusFilter : undefined,
            service: serviceFilter !== 'All' ? serviceFilter : undefined,
            priority: priorityFilter !== 'All' ? priorityFilter : undefined
          }
        }),
        api.get('/users').catch((err) => {
          console.warn('Could not load users:', err);
          return { data: [] };
        })
      ]);
      setEnquiries(enquiryRes?.data || []);
      setEmployees(userRes?.data || []);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, serviceFilter, priorityFilter]);

  const handleOpenCreateModal = () => {
    setSelectedEnquiryForEdit(null);
    setIsEnquiryModalOpen(true);
  };

  const handleOpenEditModal = (enquiry) => {
    setSelectedEnquiryForEdit(enquiry);
    setIsEnquiryModalOpen(true);
  };

  const handleOpenConvertModal = (enquiry) => {
    setSelectedEnquiryForConvert(enquiry);
    setIsConvertModalOpen(true);
  };

  const handleDeleteEnquiry = async (id, leadName) => {
    if (!window.confirm(`Are you sure you want to delete enquiry for "${leadName}"?`)) return;
    try {
      await api.delete(`/enquiries/${id}`);
      setEnquiries((prev) => prev.filter((item) => item._id !== id));
      fetchEnquiries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete enquiry');
    }
  };

  const handleQuickStatusChange = async (enquiryId, newStatus) => {
    // Optimistic UI update
    setEnquiries((prev) =>
      prev.map((item) => (item._id === enquiryId ? { ...item, status: newStatus } : item))
    );
    try {
      await api.put(`/enquiries/${enquiryId}`, { status: newStatus });
      fetchEnquiries();
    } catch (err) {
      alert('Failed to update enquiry status');
      fetchEnquiries();
    }
  };

  // Collect all unique services across enquiries for the filter dropdown
  const allServicesList = useMemo(() => {
    const set = new Set();
    enquiries.forEach((e) => {
      if (Array.isArray(e.services)) {
        e.services.forEach((s) => set.add(s));
      }
    });
    return Array.from(set);
  }, [enquiries]);

  // Filtered enquiries by search
  const filteredEnquiries = useMemo(() => {
    if (!search.trim()) return enquiries;
    const q = search.toLowerCase();
    return enquiries.filter((e) => {
      const nameMatch = e.leadName && e.leadName.toLowerCase().includes(q);
      const phoneMatch = e.phone && e.phone.includes(q);
      const emailMatch = e.email && e.email.toLowerCase().includes(q);
      const notesMatch = e.notes && e.notes.toLowerCase().includes(q);
      const serviceMatch = e.services && e.services.some((s) => s.toLowerCase().includes(q));
      return nameMatch || phoneMatch || emailMatch || notesMatch || serviceMatch;
    });
  }, [enquiries, search]);

  // Compute metrics
  const stats = useMemo(() => {
    const total = enquiries.length;
    const newCount = enquiries.filter((e) => e.status === 'New').length;
    const inDiscussion = enquiries.filter((e) => e.status === 'In Discussion').length;
    const converted = enquiries.filter((e) => e.status === 'Converted').length;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
    return { total, newCount, inDiscussion, converted, conversionRate };
  }, [enquiries]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#52A636]/10 text-[#52A636]">
              <Contact2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#0A1E3F]">Enquiries & Lead Management</h1>
              <p className="text-xs text-slate-500">
                Capture incoming client leads, select multiple requested services, and convert qualified leads into tasks.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center space-x-2 rounded-xl bg-[#52A636] px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-[#438A2B] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Enquiry</span>
        </button>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Enquiries"
          value={stats.total}
          icon={Contact2}
          color="navy"
          subtitle="All recorded leads"
        />
        <StatCard
          title="New Leads"
          value={stats.newCount}
          icon={Sparkles}
          color="blue"
          subtitle="Needs initial contact"
        />
        <StatCard
          title="In Discussion"
          value={stats.inDiscussion}
          icon={Clock}
          color="amber"
          subtitle="Follow-up active"
        />
        <StatCard
          title="Converted to Tasks"
          value={stats.converted}
          icon={CheckCircle2}
          color="green"
          trend={`${stats.conversionRate}% Conversion Rate`}
        />
      </div>

      {/* Filter & Search Bar */}
      <GlacierCard className="p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="flex w-full sm:w-72 items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
              <Search className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search lead name, phone, service, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs outline-none text-slate-800"
              />
            </div>

            <div className="flex items-center space-x-1 text-slate-400 mr-1">
              <Filter className="h-4 w-4" />
              <span className="text-xs font-bold text-slate-600">Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0A1E3F] outline-none cursor-pointer focus:border-[#52A636]"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Discussion">In Discussion</option>
              <option value="Converted">Converted</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Service Filter */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0A1E3F] outline-none cursor-pointer focus:border-[#52A636] max-w-[200px] truncate"
            >
              <option value="All">All Services</option>
              {allServicesList.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0A1E3F] outline-none cursor-pointer focus:border-[#52A636]"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            {/* Reset Filters */}
            {(statusFilter !== 'All' || serviceFilter !== 'All' || priorityFilter !== 'All' || search) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('All');
                  setServiceFilter('All');
                  setPriorityFilter('All');
                  setSearch('');
                }}
                className="flex items-center space-x-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-500 self-end lg:self-auto">
            Showing <strong className="text-[#0A1E3F]">{filteredEnquiries.length}</strong> enquiries
          </div>
        </div>
      </GlacierCard>

      {/* Enquiries Data Table */}
      <GlacierCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Lead Name</th>
                <th className="py-3.5 px-4">Phone & Contact</th>
                <th className="py-3.5 px-4">Services Requested</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date / Details</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center font-medium text-slate-400">
                    Loading lead enquiries...
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                        <Contact2 className="h-7 w-7" />
                      </div>
                      <div className="text-sm font-bold text-slate-700">No Enquiries Found</div>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Create your first lead enquiry to track service requests and easily convert them into actionable tasks.
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="mt-2 flex items-center space-x-1.5 rounded-xl bg-[#52A636] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#438A2B] transition cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Enquiry</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enquiry) => {
                  const isConverted = enquiry.status === 'Converted' || Boolean(enquiry.convertedTask);

                  // Status style
                  let statusBadgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (enquiry.status === 'In Discussion') statusBadgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
                  else if (enquiry.status === 'Converted') statusBadgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  else if (enquiry.status === 'Closed') statusBadgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';

                  // Priority style
                  let priorityStyle = 'bg-slate-100 text-slate-700';
                  if (enquiry.priority === 'Critical') priorityStyle = 'bg-rose-100 text-rose-800 font-bold';
                  else if (enquiry.priority === 'High') priorityStyle = 'bg-orange-100 text-orange-800 font-bold';
                  else if (enquiry.priority === 'Medium') priorityStyle = 'bg-blue-50 text-blue-700';

                  const createdDate = enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString('en-GB') : '-';

                  return (
                    <tr key={enquiry._id} className="hover:bg-slate-50/60 transition duration-150">
                      
                      {/* Lead Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0A1E3F] text-sm flex items-center space-x-2">
                          <span>{enquiry.leadName}</span>
                        </div>
                        {enquiry.email && (
                          <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span>{enquiry.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Phone & Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <a
                          href={`tel:${enquiry.phone}`}
                          className="inline-flex items-center space-x-1.5 font-bold text-slate-800 hover:text-[#52A636] transition"
                          title="Click to call"
                        >
                          <Phone className="h-3.5 w-3.5 text-[#52A636]" />
                          <span>{enquiry.phone}</span>
                        </a>
                      </td>

                      {/* Services Requested (Multiple Choice) */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1.5">
                          {enquiry.services && enquiry.services.length > 0 ? (
                            enquiry.services.map((srv, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200/80"
                              >
                                {srv}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No services selected</span>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] ${priorityStyle}`}>
                          {enquiry.priority || 'Medium'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={enquiry.status}
                          onChange={(e) => handleQuickStatusChange(enquiry._id, e.target.value)}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold outline-none cursor-pointer transition ${statusBadgeStyle}`}
                        >
                          <option value="New">New</option>
                          <option value="In Discussion">In Discussion</option>
                          <option value="Converted">Converted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      {/* Date / Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1 text-slate-600 font-medium text-[11px]">
                          <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{createdDate}</span>
                        </div>
                        {enquiry.notes && (
                          <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1 max-w-[200px]" title={enquiry.notes}>
                            {enquiry.notes}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          
                          {/* CONVERT TO TASK BUTTON */}
                          {!isConverted ? (
                            <button
                              onClick={() => handleOpenConvertModal(enquiry)}
                              className="flex items-center space-x-1 rounded-xl bg-[#52A636] px-3 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-[#438A2B] transition cursor-pointer"
                              title="Convert this enquiry to a new task on the Task Board"
                            >
                              <ArrowRightCircle className="h-3.5 w-3.5" />
                              <span>Convert to Task</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate('/tasks')}
                              className="flex items-center space-x-1 rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                              title="View linked task on Task Board"
                            >
                              <KanbanSquare className="h-3 w-3 text-[#52A636]" />
                              <span>Task Created ✓</span>
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(enquiry)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                            title="Edit Enquiry"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteEnquiry(enquiry._id, enquiry.leadName)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modals */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => {
          setIsEnquiryModalOpen(false);
          setSelectedEnquiryForEdit(null);
        }}
        onSuccess={fetchEnquiries}
        enquiry={selectedEnquiryForEdit}
        employees={employees}
      />

      <ConvertToTaskModal
        isOpen={isConvertModalOpen}
        onClose={() => {
          setIsConvertModalOpen(false);
          setSelectedEnquiryForConvert(null);
        }}
        enquiry={selectedEnquiryForConvert}
        employees={employees}
        onSuccess={fetchEnquiries}
      />
    </div>
  );
};

export default EnquiriesPage;
