import React from 'react';
import { Calendar, User, Clock, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Building2, Trash2, UserPlus } from 'lucide-react';
import Badge from '../common/Badge';

const TaskTable = ({ tasks = [], onStatusChange, onDeleteTask, onDelegateTask, currentUser }) => {
  const statusOptions = ['Assigned', 'In Progress', 'Completed', "Can't Complete"];

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Assigned':
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case "Can't Complete":
      case 'On Hold':
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const isSuperOrDeptAdmin = currentUser && (currentUser.role === 'Super Admin' || currentUser.role.includes('Admin'));

  return (
    <div className="glacier-card p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[950px]">
          <thead className="bg-[#0F2B48] text-white">
            <tr>
              <th className="p-3.5 font-semibold">Task Title & Details</th>
              <th className="p-3.5 font-semibold">Type & Department</th>
              <th className="p-3.5 font-semibold">Client Context</th>
              <th className="p-3.5 font-semibold">Hierarchy Flow (Assigned By ➔ To)</th>
              <th className="p-3.5 font-semibold">Priority</th>
              <th className="p-3.5 font-semibold">Deadline</th>
              <th className="p-3.5 font-semibold text-center">Status Update</th>
              {isSuperOrDeptAdmin && <th className="p-3.5 text-center font-semibold">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-slate-400 font-medium">
                  No tasks found matching your filter criteria.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isOverdue = new Date(task.dueDate) < new Date() && !['Completed', "Can't Complete"].includes(task.status);
                const createdDateFormatted = task.createdAt
                  ? new Date(task.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                  : new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

                return (
                  <tr key={task._id} className="hover:bg-slate-50 transition">
                    {/* Title & Remarks */}
                    <td className="p-3.5 max-w-[240px]">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <h4 className="font-extrabold text-slate-800 text-xs leading-snug">{task.taskName}</h4>
                      </div>
                      {task.remarks && (
                        <p className="text-[11px] text-slate-500 line-clamp-2">{task.remarks}</p>
                      )}
                      <span className="text-[10px] text-slate-400 mt-1 block">Created: {createdDateFormatted}</span>
                    </td>

                    {/* Task Type & Department */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          task.taskType === 'Client Task' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {task.taskType || (task.client ? 'Client Task' : 'Common Task')}
                        </span>
                        <p className="font-bold text-[#0F2B48] text-xs">{task.department}</p>
                      </div>
                    </td>

                    {/* Client Context */}
                    <td className="p-3.5">
                      {task.client ? (
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{task.client.clientName}</p>
                          <p className="text-[10px] text-slate-500">{task.client.gstin || task.client.pan || 'Active Client'}</p>
                        </div>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                          Common Department Task
                        </span>
                      )}
                    </td>

                    {/* Hierarchy Flow */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-1 text-[11px]">
                        <span className="font-semibold text-slate-700">{task.assignedBy?.name || 'Super Admin'}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="font-extrabold text-[#52A636]">{task.assignedEmployee?.name || 'Staff'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        ({task.assignedEmployee?.designation || task.assignedEmployee?.role || 'Executive'})
                      </span>
                      {isSuperOrDeptAdmin && onDelegateTask && (
                        <button
                          onClick={() => onDelegateTask(task)}
                          title="Delegate / Reassign task to Junior Executive"
                          className="mt-1.5 flex items-center space-x-1 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-extrabold text-blue-700 hover:bg-blue-100 transition cursor-pointer border border-blue-200"
                        >
                          <UserPlus className="h-3 w-3" />
                          <span>Delegate to Junior</span>
                        </button>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="p-3.5">
                      <Badge status={task.priority} />
                    </td>

                    {/* Deadline */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className={`flex items-center space-x-1 font-semibold text-xs ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {isOverdue && <span className="text-[9px] font-extrabold text-rose-600 uppercase">OVERDUE</span>}
                    </td>

                    {/* Interactive Status Selector */}
                    <td className="p-3.5 text-center">
                      <select
                        value={statusOptions.includes(task.status) ? task.status : (task.status === 'Pending' ? 'Assigned' : task.status)}
                        onChange={(e) => onStatusChange && onStatusChange(task._id, e.target.value)}
                        className={`rounded-xl border px-2.5 py-1.5 text-xs font-extrabold outline-none cursor-pointer shadow-xs transition ${getStatusBadgeStyle(task.status)}`}
                      >
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Can't Complete">Can't Complete</option>
                      </select>
                    </td>

                    {/* Admin Delete Action */}
                    {isSuperOrDeptAdmin && (
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onDeleteTask && onDeleteTask(task._id, task.taskName)}
                          title="Delete Task"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;
