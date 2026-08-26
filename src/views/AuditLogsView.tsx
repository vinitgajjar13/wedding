import React, { useState, useEffect } from 'react';
import { History, Shield, Clock, Search, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { AuditLog } from '../types/index.js';

export const AuditLogsView: React.FC = () => {
  const { refreshTrigger, showToast } = useApp();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api
      .getAuditLogs()
      .then(setLogs)
      .catch((err) => {
        console.error(err);
        showToast('Failed to load audit logs', 'error');
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              System Security & Operational Audit Trail
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Immutable log of store operations, booking modifications, cash/deposit receipts & returns
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator / Staff</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity & Reference</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-stone-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-stone-400">
                    No audit records logged yet
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                      {new Date(l.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">{l.userName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-800 rounded font-semibold text-[10px] uppercase">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-700">
                      {l.entityType} #{l.entityId}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">{l.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
