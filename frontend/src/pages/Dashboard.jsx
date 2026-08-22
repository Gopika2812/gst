import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GlacierCard from '../components/common/GlacierCard';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import TaskModal from '../components/tasks/TaskModal';
import ClientModal from '../components/clients/ClientModal';
import TaskTable from '../components/tasks/TaskTable';
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
  ArrowUpRight,
  Filter,
  BarChart2,
  ShieldCheck,
  CheckSquare,
  FileCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [dateFilter, setDateFilter] = useState('This Month');
  const [loading, setLoading] = useState(true);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  const isSuperAdmin = user?.role === 'Super Admin';
  const isAdmin = user?.role && user.role.includes('Admin') && !isSuperAdmin;
  const isExecutive = !isSuperAdmin && !isAdmin;

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, clientRes, userRes, taskRes] = await Promise.all([
        api.get('/reports/dashboard-summary'),
        isSuperAdmin || isAdmin ? api.get('/clients') : Promise.resolve({ data: [] }),
        isSuperAdmin || isAdmin ? api.get('/users') : Promise.resolve({ data: [] }),
        api.get('/tasks', { params: { myTasksOnly: true } })
      ]);
      setSummary(sumRes.data);
      setClients(clientRes.data);
      setEmployees(userRes.data);
      setMyTasks(taskRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

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
                <h1 className="text-lg sm:text-xl font-extrabold text-white">Welcome back, {user?.name || 'User'}</h1>
                <span className="rounded-full bg-[#52A636] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-xs">
                  {user?.role || 'Staff'}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Firm Operations • Department: <strong className="text-white font-bold">{user?.department || 'General'}</strong>
                {isExecutive && <span className="ml-2 font-medium text-emerald-300">• My Daily Work Dashboard</span>}
              </p>
            </div>
          </div>

          {/* Action Buttons: Super Admin has Add Client + Assign Task; Dept Admin has Assign Task; Executives have NO action buttons */}
          {(isSuperAdmin || isAdmin) && (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {isSuperAdmin && (
                <button
                  onClick={() => setIsClientModalOpen(true)}
                  className="flex-1 sm:flex-none justify-center flex items-center space-x-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md border border-white/20 transition hover:bg-white/20 cursor-pointer"
                >
                  <span>Add Client</span>
                </button>
              )}
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex-1 sm:flex-none justify-center flex items-center space-x-1.5 rounded-xl bg-[#52A636] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#438A2B] cursor-pointer"
              >
                <span>Assign Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <h2 className="text-xs sm:text-sm font-bold text-[#0F2B48] uppercase tracking-wider">
          {isExecutive ? 'My Daily Workflow Overview' : (isSuperAdmin ? 'Firm Executive Overview' : `${user?.department} Department Overview`)}
        </h2>
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

      {/* EXECUTIVE / STAFF TAILORED DASHBOARD */}
      {isExecutive ? (
        <div className="space-y-6">
          {/* Executive Stat Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="glacier-card rounded-2xl p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Today's Assigned</span>
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-800">{counters.todaysTasksCount || 0}</p>
            </div>
            <div className="glacier-card rounded-2xl p-4 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Pending Tasks</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-800">{counters.pendingTasksCount || 0}</p>
            </div>
            <div className="glacier-card rounded-2xl p-4 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Completed Tasks</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-800">{counters.completedTasksCount || 0}</p>
            </div>
            <div className="glacier-card rounded-2xl p-4 border-l-4 border-rose-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Overdue Tasks</span>
                <AlertTriangle className="h-4 w-4 text-rose-500" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-rose-600">{counters.overdueTasksCount || 0}</p>
            </div>
          </div>

          {/* Executive Daily Assigned Tasks List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#0F2B48] flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-[#52A636]" />
                <span>My Assigned Daily Tasks</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">Showing {myTasks.length} tasks</span>
            </div>

            <TaskTable
              tasks={myTasks}
              onStatusChange={handleTaskStatusChange}
              currentUser={user}
            />
          </div>
        </div>
      ) : (
        /* SUPER ADMIN & DEPARTMENT ADMIN DASHBOARD */
        <div className="space-y-6">
          {/* Stat Cards Grid */}
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
            {isSuperAdmin ? (
              <>
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
              </>
            ) : (
              <>
                <StatCard
                  title="Department Pending Tasks"
                  value={counters.pendingTasksCount || 0}
                  subtitle="Tasks awaiting completion"
                  icon={Clock}
                  color="blue"
                />
                <StatCard
                  title="Department Completed Tasks"
                  value={counters.completedTasksCount || 0}
                  subtitle="Successfully processed tasks"
                  icon={CheckCircle2}
                  color="green"
                />
              </>
            )}
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
            {/* Monthly Revenue Chart for Super Admin, or Dept Performance for Admin */}
            {isSuperAdmin ? (
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
            ) : (
              <GlacierCard title={`${user?.department} Task Management`} subtitle="Department task distribution" className="lg:col-span-2">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-700 text-xs">Total Department Pending Tasks</span>
                    <span className="font-extrabold text-[#0F2B48] text-sm">{counters.pendingTasksCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <span className="font-bold text-emerald-800 text-xs">Total Department Completed Tasks</span>
                    <span className="font-extrabold text-[#52A636] text-sm">{counters.completedTasksCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl">
                    <span className="font-bold text-rose-800 text-xs">Total Department Overdue Tasks</span>
                    <span className="font-extrabold text-rose-600 text-sm">{counters.overdueTasksCount || 0}</span>
                  </div>
                </div>
              </GlacierCard>
            )}

            {/* Recent Task Activity Timeline */}
            <GlacierCard title="Recent Task Activity" subtitle="Real-time updates from filing teams">
              <div className="mt-2 divide-y divide-slate-100">
                {recentTasks.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 text-center">No recent tasks</p>
                ) : (
                  recentTasks.map((t) => (
                    <div key={t._id} className="py-3 flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{t.taskName}</h4>
                        <p className="text-[11px] text-slate-500">{t.client?.clientName || t.department}</p>
                        <span className="text-[10px] text-slate-400">Assigned: {t.assignedEmployee?.name || 'Staff'}</span>
                      </div>
                      <Badge status={t.status} />
                    </div>
                  ))
                )}
              </div>
            </GlacierCard>
          </div>
        </div>
      )}

      {/* Task & Client Modals for Super Admin / Admin */}
      {(isSuperAdmin || isAdmin) && (
        <>
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onRefresh={fetchDashboardData}
            clients={clients}
            employees={employees}
          />
          {isSuperAdmin && (
            <ClientModal
              isOpen={isClientModalOpen}
              onClose={() => setIsClientModalOpen(false)}
              onRefresh={fetchDashboardData}
              employees={employees}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
