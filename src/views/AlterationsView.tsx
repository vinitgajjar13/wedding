import React, { useState, useEffect } from 'react';
import { Scissors, Clock, CheckCircle2, AlertCircle, Plus, User, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { AlterationTask, AlterationStatus } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';

export const AlterationsView: React.FC = () => {
  const { showToast, refreshTrigger, triggerRefresh } = useApp();
  const [tasks, setTasks] = useState<AlterationTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api
      .getAlterations()
      .then(setTasks)
      .catch((err) => {
        console.error(err);
        showToast('Failed to load alteration tasks', 'error');
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const handleUpdateStatus = async (taskId: string, newStatus: AlterationStatus) => {
    try {
      await api.updateAlterationStatus(taskId, newStatus);
      showToast(`Task status updated to ${newStatus}`, 'success');
      triggerRefresh();
    } catch (err) {
      showToast('Failed to update alteration status', 'error');
    }
  };

  const columns: Array<{ id: string; title: string; color: string }> = [
    { id: 'Pending', title: 'Pending / In Queue', color: 'border-stone-300' },
    { id: 'In Progress', title: 'With Master Tailor', color: 'border-amber-400' },
    { id: 'Ready', title: 'Ready for Trial / Delivery', color: 'border-emerald-400' },
    { id: 'Completed', title: 'Completed & Dispatched', color: 'border-stone-200' },
  ];

  const matchesStatus = (taskStatus: string, colId: string) => {
    return (
      taskStatus.toLowerCase().replace('_', ' ') === colId.toLowerCase().replace('_', ' ') ||
      taskStatus.toLowerCase() === colId.toLowerCase()
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Alterations & Master Tailor Kanban Board
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Tracking garment alterations, trial dates, sleeve adjustments, and lehenga waist fittings
          </p>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => matchesStatus(t.status as string, col.id));
          return (
            <div key={col.id} className="bg-[#FAF8F5] rounded-2xl border border-[#EBE4D5] p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="font-luxury font-bold text-xs text-stone-800">{col.title}</span>
                <span className="w-5 h-5 rounded-full bg-white border border-stone-200 text-[10px] font-bold text-stone-700 flex items-center justify-center">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-stone-500">{task.id}</span>
                      <span className="font-mono text-[10px] text-[#9E7B3B] font-semibold">{task.bookingId}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-stone-900">{task.customerName}</h4>
                      <p className="text-[11px] text-stone-500">{task.productName}</p>
                    </div>

                    <div className="p-2.5 bg-[#FCFAF7] rounded-lg border border-[#EFE8DC] text-[11px] text-stone-700 leading-relaxed italic">
                      "{task.instructions}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                      <div className="flex items-center gap-1 font-medium text-stone-700">
                        <User className="w-3 h-3 text-[#C5A059]" />
                        <span>{task.tailorName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-stone-500">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>

                    {/* Status Mover */}
                    <div className="pt-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value as AlterationStatus)}
                        className="w-full text-[11px] px-2 py-1 bg-stone-50 border border-stone-200 rounded-md outline-none font-semibold text-stone-800"
                      >
                        <option value="pending">Move: Pending</option>
                        <option value="in_progress">Move: In Progress</option>
                        <option value="ready">Move: Ready for Trial</option>
                        <option value="completed">Move: Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
