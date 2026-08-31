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
  FileCheck,
  XCircle,
  PlayCircle
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

  const fetchDashboardData = async (isInitial = false) => {
    if (isInitial || !summary) setLoading(true);
    try {
      const [sumRes, clientRes, userRes, taskRes] = await Promise.all([
        api.get('/reports/dashboard-summary'),
        isSuperAdmin || isAdmin ? api.get('/clients') : Promise.resolve({ data: [] }),
        isSuperAdmin || isAdmin ? api.get('/users') : Promise.resolve({ data: [] }),
        api.get('/tasks', { params: { myTasksOnly: isExecutive ? true : false } })
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
    fetchDashboardData(true);
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

          {/* Action Buttons */}
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
          {isExecutive ? 'My Daily Workflow Overview' : (isSuperAdmin ? 'Firm Task Process Overview' : `${user?.department} Task Process Overview`)}
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

      {/* 1st ROW: ALL TASK PROCESS STATUS CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="Today's Tasks"
          value={counters.todaysTasksCount || 0}
          subtitle="Assigned or created today"
          icon={Calendar}
          color="navy"
        />
        <StatCard
          title="In Progress Tasks"
          value={counters.inProgressTasksCount || 0}
          subtitle="Currently undergoing work"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Completed Tasks"
          value={counters.completedTasksCount || 0}
          subtitle="Successfully completed"
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Can't Complete"
          value={counters.cantCompleteTasksCount || 0}
          subtitle="On hold / pending info"
          icon={XCircle}
          color="amber"
        />
        <StatCard
          title="Overdue Tasks"
          value={counters.overdueTasksCount || 0}
          subtitle="Passed deadline date"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* CLIENT SUBSCRIBED SERVICE REMINDERS (START DATE ➔ DUE DATE) */}
      <GlacierCard title="Client Service Filing Reminders" subtitle="Active Start Date to Due Date Tracking (Completed services are automatically dismissed for the month)">
        <div className="mt-2 space-y-3">
          {(() => {
            const isServiceCompletedThisMonth = (client, service) => {
              const now = new Date();
              const currentMonth = now.getMonth();
              const currentYear = now.getFullYear();

              return myTasks.some((t) => {
                const taskDate = new Date(t.dueDate || t.createdAt);
                const sameClient = String(t.client?._id || t.client) === String(client._id);
                const sameMonth = taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
                const sameService =
                  (t.taskName && service.subServiceName && t.taskName.toLowerCase().includes(service.subServiceName.toLowerCase())) ||
                  (service.subServiceName && t.taskName && service.subServiceName.toLowerCase().includes(t.taskName.toLowerCase())) ||
                  (t.department === service.department);
                return sameClient && sameMonth && sameService && t.status === 'Completed';
              });
            };

            const activeReminders = clients.flatMap((client) =>
              (client.subscribedServices || []).filter((service) => {
                // If executive, only show services assigned to them or their client
                if (isExecutive) {
                  const isAssigned = String(service.assignedStaff) === String(user?._id) || String(client.responsibleEmployee?._id || client.responsibleEmployee) === String(user?._id);
                  if (!isAssigned) return false;
                }
                // Dismiss if already completed for this month
                return !isServiceCompletedThisMonth(client, service);
              }).map((service, idx) => ({ client, service, idx }))
            );

            if (activeReminders.length === 0) {
              return (
                <div className="py-6 text-center text-xs text-slate-400">
                  {clients.length === 0
                    ? 'No client service subscriptions configured yet.'
                    : 'All client service reminders for this month are completed and up to date! 🎉'}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {activeReminders.map(({ client, service, idx }) => {
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = now.getMonth();

                  const startDate = new Date(year, month, service.startDayOfMonth || 1);
                  const dueDate = new Date(year, month, service.dueDayOfMonth || 11);

                  const startDateStr = startDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const dueDateStr = dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

                  const assignedStaffObj = employees.find((e) => String(e._id) === String(service.assignedStaff)) || client.responsibleEmployee;

                  return (
                    <div key={`${client._id}-${idx}`} className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 hover:bg-slate-100/60 transition space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#0F2B48] text-white">
                            {service.department}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1">{service.subServiceName}</h4>
                          <p className="text-[11px] font-semibold text-[#52A636]">{client.clientName}</p>
                        </div>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Due: {dueDateStr}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                        <span>Window: <strong>{startDateStr}</strong> ➔ <strong>{dueDateStr}</strong></span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Assigned Staff:</span>
                        <strong className="text-slate-800">{assignedStaffObj?.name || 'Assigned Executive'}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </GlacierCard>

      {/* EXECUTIVE / STAFF TAILORED WORKFLOW TABLE */}
      {isExecutive ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F2B48] flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-[#52A636]" />
              <span>My Daily Assigned Tasks</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">Showing {myTasks.length} tasks</span>
          </div>

          <TaskTable
            tasks={myTasks}
            onStatusChange={handleTaskStatusChange}
            currentUser={user}
          />
        </div>
      ) : null}

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
