import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Search,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shirt,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { ReturnRecord } from '../types/index.js';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { ReturnInspectionModal } from '../components/returns/ReturnInspectionModal.js';

export const ReturnsView: React.FC = () => {
  const { openReturnModal, refreshTrigger, showToast } = useApp();
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    api
      .getReturns()
      .then(setReturns)
      .catch((err) => {
        console.error(err);
        showToast('Failed to load returns', 'error');
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const filtered = returns.filter(
    (r) =>
      (r.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.bookingNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.processedBy || (r as any).inspectorName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Garment Returns & Escrow Inspection
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Condition assessment, late fee computation, damage deduction & security deposit refunds
          </p>
        </div>

        <button
          onClick={() => openReturnModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F2421] text-white hover:bg-[#323A35] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#C5A059]" />
          <span>+ Inspect New Return</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-[#EBE4D5] shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search return by booking #, customer name, inspector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Booking #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Return Date</th>
                <th className="py-3 px-4 text-center">Late Days</th>
                <th className="py-3 px-4 text-right">Late Fee</th>
                <th className="py-3 px-4 text-right">Damage Fee</th>
                <th className="py-3 px-4 text-right">Deposit Refunded</th>
                <th className="py-3 px-4">Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-stone-400">
                    Loading return records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-stone-400">
                    No returns logged yet
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {r.bookingNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                      {r.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">{r.returnDate}</td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      {r.lateDays > 0 ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[11px]">
                          {r.lateDays} Days Late
                        </span>
                      ) : (
                        <span className="text-emerald-700">On Time</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-700 font-medium">
                      <CurrencyDisplay amount={r.totalLateFee ?? (r as any).lateFeeCharged ?? 0} />
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-700 font-medium">
                      <CurrencyDisplay amount={r.totalDamageCost ?? (r as any).damageFeeCharged ?? 0} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-800">
                      <CurrencyDisplay amount={r.netDepositRefund ?? (r as any).depositRefunded ?? 0} />
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">
                      {r.processedBy || (r as any).inspectorName || 'Store Manager'}
                    </td>
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
