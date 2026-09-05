import React, { useState, useEffect, useMemo } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskTable from '../components/tasks/TaskTable';
import TaskModal from '../components/tasks/TaskModal';
import DelegateModal from '../components/tasks/DelegateModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { KanbanSquare, Table, Plus, Filter, Calendar, User, Clock, CheckCircle2, Building2, Search } from 'lucide-react';

const TaskBoardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [delegatingTask, setDelegatingTask] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const [taskRes, clientRes, userRes] = await Promise.all([
        api.get('/tasks', {
          params: {
            department: departmentFilter,
            status: statusFilter,
            myTasksOnly
          }
        }),
        api.get('/clients'),
        api.get('/users')
      ]);
      setTasks(taskRes.data);
      setClients(clientRes.data);
      setEmployees(userRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [departmentFilter, statusFilter, myTasksOnly]);

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status');
      fetchTasks();
    }
  };

  const handleOpenDelegateModal = (taskToDelegate) => {
    setDelegatingTask(taskToDelegate);
    setIsDelegateModalOpen(true);
  };

  const handleDeleteTask = async (taskId, taskName) => {
    if (!window.confirm(`Are you sure you want to delete task "${taskName}"?`)) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter((t) =>
      (t.taskName && t.taskName.toLowerCase().includes(q)) ||
      (t.remarks && t.remarks.toLowerCase().includes(q)) ||
      (t.department && t.department.toLowerCase().includes(q)) ||
      (t.client?.clientName && t.client.clientName.toLowerCase().includes(q)) ||
      (t.assignedEmployee?.name && t.assignedEmployee.name.toLowerCase().includes(q)) ||
      (t.assignedBy?.name && t.assignedBy.name.toLowerCase().includes(q)) ||
      (t.priority && t.priority.toLowerCase().includes(q)) ||
      (t.status && t.status.toLowerCase().includes(q))
    );
  }, [tasks, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0A1E3F]">Task Assignment & Delegation Board</h1>
          <p className="text-xs text-slate-500">
            Super Admin assigns to Admins • Department Admins assign to Executives • Update status: <strong className="text-[#0A1E3F]">Assigned ➔ In Progress ➔ Completed / Can't Complete</strong>
          </p>
        </div>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#52A636] px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-[#438A2B] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Filter & View Switcher Bar */}
      <GlacierCard className="p-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex w-full sm:w-64 items-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
              <Search className="mr-1.5 h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search tasks, clients, staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <div className="flex items-center space-x-1 text-slate-400 mr-1">
              <Filter className="h-4 w-4" />
              <span className="text-xs font-bold text-slate-600">Filters:</span>
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0A1E3F] outline-none cursor-pointer focus:border-[#52A636]"
            >
              <option value="">All Departments</option>
              <option value="GST">GST</option>
              <option value="Income Tax">Income Tax</option>
              <option value="Accounts">Accounts</option>
              <option value="Administration">Administration</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0A1E3F] outline-none cursor-pointer focus:border-[#52A636]"
            >
              <option value="">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Can't Complete">Can't Complete</option>
            </select>

            {/* My Tasks Checkbox */}
            <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <input
                type="checkbox"
                checked={myTasksOnly}
                onChange={(e) => setMyTasksOnly(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-[#52A636]"
              />
              <span>My Assigned Only</span>
            </label>
          </div>

          {/* View Mode Toggle Switch */}
          <div className="flex items-center space-x-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80 self-end lg:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'table' ? 'bg-[#0A1E3F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'kanban' ? 'bg-[#0A1E3F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KanbanSquare className="h-3.5 w-3.5" />
              <span>Kanban Board</span>
            </button>
          </div>
        </div>
      </GlacierCard>

      {/* Render Table or Kanban View */}
      {loading ? (
        <div className="glacier-card p-12 text-center text-slate-400 font-semibold">
          Loading assigned tasks...
        </div>
      ) : viewMode === 'table' ? (
        <TaskTable
          tasks={filteredTasks}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
          onDelegateTask={handleOpenDelegateModal}
          currentUser={user}
        />
      ) : (
        <KanbanBoard tasks={filteredTasks} onStatusChange={handleStatusChange} />
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onRefresh={fetchTasks}
        clients={clients}
        employees={employees}
      />

      <DelegateModal
        isOpen={isDelegateModalOpen}
        onClose={() => {
          setIsDelegateModalOpen(false);
          setDelegatingTask(null);
        }}
        task={delegatingTask}
        employees={employees}
        onDelegated={fetchTasks}
        currentUser={user}
      />
    </div>
  );
};

export default TaskBoardPage;
