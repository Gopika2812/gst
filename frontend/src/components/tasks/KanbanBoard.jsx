import React, { useState } from 'react';
import { Calendar, User, Clock, AlertCircle, Paperclip, CheckCircle2, ChevronRight } from 'lucide-react';
import Badge from '../common/Badge';

const KanbanBoard = ({ tasks = [], onStatusChange }) => {
  const columns = [
    { id: 'Assigned', name: 'Assigned', match: ['Assigned', 'Pending'], color: 'border-amber-400 bg-amber-50/40 text-amber-900' },
    { id: 'In Progress', name: 'In Progress', match: ['In Progress'], color: 'border-blue-500 bg-blue-50/40 text-blue-900' },
    { id: 'Completed', name: 'Completed', match: ['Completed'], color: 'border-emerald-500 bg-emerald-50/40 text-emerald-900' },
    { id: "Can't Complete", name: "Can't Complete", match: ["Can't Complete", 'Waiting', 'On Hold', 'Cancelled'], color: 'border-rose-400 bg-rose-50/40 text-rose-900' }
  ];

  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId && onStatusChange) {
      onStatusChange(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="flex overflow-x-auto gap-4 pb-4 snap-x lg:grid lg:grid-cols-4 no-scrollbar">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => col.match ? col.match.includes(t.status) : t.status === col.id);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="flex flex-col rounded-2xl border border-slate-200/80 bg-slate-100/60 p-3 min-h-[450px] sm:min-h-[500px] min-w-[270px] sm:min-w-[280px] lg:min-w-0 snap-start flex-1"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between rounded-xl border p-2.5 mb-3 ${col.color}`}>
              <span className="font-bold text-xs">{col.name}</span>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold shadow-xs">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
                  Drop tasks here
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    className="glacier-card group cursor-grab rounded-xl p-3.5 shadow-xs transition hover:shadow-md active:cursor-grabbing border border-slate-200/90"
                  >
                    {/* Header: Dept & Priority */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md bg-[#0A1E3F] px-2 py-0.5 text-[10px] font-semibold text-white">
                        {task.department}
                      </span>
                      <Badge status={task.priority} />
                    </div>

                    {/* Task Title & Client */}
                    <h4 className="font-bold text-slate-800 text-xs leading-snug">{task.taskName}</h4>
                    <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                      {task.client?.clientName || 'Unassigned Client'}
                    </p>

                    {/* Metadata Footer */}
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-[#C59B27]" />
                        <span className="truncate max-w-[80px]">{task.assignedEmployee?.name || 'Staff'}</span>
                      </div>
                    </div>

                    {/* Quick Move Buttons for Touch / Non-drag */}
                    <div className="mt-2 flex lg:hidden lg:group-hover:flex items-center justify-between pt-1.5 border-t border-slate-100">
                      <span className="text-[9px] text-slate-400 font-medium">Move to:</span>
                      <div className="flex space-x-1">
                        {columns.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => onStatusChange(task._id, c.id)}
                            title={`Move to ${c.name}`}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold transition ${
                              task.status === c.id ? 'bg-[#C59B27] text-white shadow-xs' : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {c.name[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
