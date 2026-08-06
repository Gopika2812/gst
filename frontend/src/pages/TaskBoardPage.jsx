import React, { useState, useEffect } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskModal from '../components/tasks/TaskModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { KanbanSquare, Plus, Filter, Calendar, User, Clock, CheckCircle2 } from 'lucide-react';

const TaskBoardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [departmentFilter, setDepartmentFilter] = useState('');
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const [taskRes, clientRes, userRes] = await Promise.all([
        api.get('/tasks', { params: { department: departmentFilter, myTasksOnly } }),
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
  }, [departmentFilter, myTasksOnly]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F2B48]">Task Assignment & Kanban Board (Module 5)</h1>
          <p className="text-xs text-slate-500">Drag & drop tasks between workflow columns (Pending ➔ In Progress ➔ Waiting ➔ Completed)</p>
        </div>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-[#52A636] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#438A2B]"
        >
          <Plus className="h-4 w-4" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Filter & View Switcher Bar */}
      <GlacierCard className="p-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-[#0F2B48] outline-none"
            >
              <option value="">All Departments</option>
              <option value="GST">GST Department</option>
              <option value="Book Keeping">Book Keeping</option>
              <option value="IT Filing">IT Filing</option>
              <option value="Registration">Registration</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={myTasksOnly}
                onChange={(e) => setMyTasksOnly(e.target.checked)}
                className="h-4 w-4 rounded accent-[#52A636]"
              />
              <span>Show My Assigned Tasks Only</span>
            </label>
          </div>
        </div>
      </GlacierCard>

      {/* Interactive Kanban Board */}
      <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onRefresh={fetchTasks}
        clients={clients}
        employees={employees}
      />
    </div>
  );
};

export default TaskBoardPage;
