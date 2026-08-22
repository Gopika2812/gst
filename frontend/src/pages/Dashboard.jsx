import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GlacierCard from '../components/common/GlacierCard';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import TaskModal from '../components/tasks/TaskModal';
import ClientModal from '../components/clients/ClientModal';
import api from '../services/api';
import {
  Users,
  Award,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Filter,
  BarChart2,
  ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [dateFilter, setDateFilter] = useState('This Month');
  const [loading, setLoading] = useState(true);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, clientRes, userRes] = await Promise.all([
        api.get('/reports/dashboard-summary'),
        api.get('/clients'),
        api.get('/users')
      ]);
      setSummary(sumRes.data);
      setClients(clientRes.data);
      setEmployees(userRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const counters = summary?.counters || {};
  const monthlyRevenue = summary?.monthlyRevenue || [];
  const recentTasks = summary?.recentTasks || [];

  return (
    <div className="space-y-6">
      {/* Top Banner: Profile Card & Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2B48] via-[#16385C] to-[#0A1E36] p-4 sm:p-6 text-white shadow-xl border border-slate-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-[#52A636] text-lg sm:text-xl font-bold text-white shadow-md border border-white/20">
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'VA'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white">Welcome back, {user?.name || 'Vigneshwaran CA'}</h1>
                <span className="rounded-full bg-[#52A636] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-xs">
                  {user?.role || 'Super Admin'}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Firm Operations • Department: <strong className="text-white font-bold">{user?.department || 'GST Management'}</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="flex-1 sm:flex-none justify-center flex items-center space-x-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md border border-white/20 transition hover:bg-white/20 cursor-pointer"
            >
              <span>Add Client</span>
            </button>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex-1 sm:flex-none justify-center flex items-center space-x-1.5 rounded-xl bg-[#52A636] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#438A2B] cursor-pointer"
            >
              <span>Assign Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <h2 className="text-xs sm:text-sm font-bold text-[#0F2B48] uppercase tracking-wider">Executive Overview</h2>
        <div className="flex items-center space-x-1 rounded-xl bg-slate-200/60 p-1 overflow-x-auto no-scrollbar">
          {['Today', 'This Week', 'This Month', 'Custom Date'].map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`whitespace-nowrap rounded-lg px-2.5 sm:px-3 py-1 text-xs font-semibold transition ${
                dateFilter === filter
                  ? 'bg-white text-[#0F2B48] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Executive Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Active Clients"
          value={counters.activeClients || 0}
          subtitle={`Total Registered: ${counters.totalClients || 0}`}
          icon={Users}
          color="navy"
          trend="+12% from last month"
        />
        <StatCard
          title="Pending Certificates"
          value={counters.pendingCertificates || 0}
          subtitle="Waiting for Certificate approval"
          icon={Award}
          color="amber"
        />
        <StatCard
          title="Total Revenue (Billed)"
          value={`₹${(counters.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtitle={`Collected: ₹${(counters.totalCollected || 0).toLocaleString('en-IN')}`}
          icon={Receipt}
          color="green"
        />
        <StatCard
          title="Outstanding Receivable"
          value={`₹${(counters.totalOutstanding || 0).toLocaleString('en-IN')}`}
          subtitle="Pending invoices due"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Task State Cards Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glacier-card rounded-2xl p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Tasks</span>
            <Calendar className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-800">{counters.todaysTasksCount || 0}</p>
        </div>
        <div className="glacier-card rounded-2xl p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Tasks</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-800">{counters.pendingTasksCount || 0}</p>
        </div>
        <div className="glacier-card rounded-2xl p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed Tasks</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-800">{counters.completedTasksCount || 0}</p>
        </div>
        <div className="glacier-card rounded-2xl p-4 border-l-4 border-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overdue Tasks</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-rose-600">{counters.overdueTasksCount || 0}</p>
        </div>
      </div>

      {/* Performance Charts & Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Revenue & Billing Trend Chart */}
        <GlacierCard title="Monthly Revenue Trend" subtitle="Billed revenue vs collections (₹)" className="lg:col-span-2">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52A636" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#52A636" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F2B48" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0F2B48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']} />
                <Area type="monotone" dataKey="revenue" stroke="#52A636" fillOpacity={1} fill="url(#colorRev)" name="Billed Revenue" />
                <Area type="monotone" dataKey="collected" stroke="#0F2B48" fillOpacity={1} fill="url(#colorCol)" name="Collected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlacierCard>

        {/* Recent Task Activity Timeline */}
        <GlacierCard title="Recent Task Activity" subtitle="Real-time updates from filing teams">
          <div className="mt-2 divide-y divide-slate-100">
            {recentTasks.map((t) => (
              <div key={t._id} className="py-3 flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{t.taskName}</h4>
                  <p className="text-[11px] text-slate-500">{t.client?.clientName}</p>
                  <span className="text-[10px] text-slate-400">Assigned: {t.assignedEmployee?.name}</span>
                </div>
                <Badge status={t.status} />
              </div>
            ))}
          </div>
        </GlacierCard>
      </div>

      {/* Task Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onRefresh={fetchDashboardData}
        clients={clients}
        employees={employees}
      />
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onRefresh={fetchDashboardData}
        employees={employees}
      />
    </div>
  );
};

export default Dashboard;
