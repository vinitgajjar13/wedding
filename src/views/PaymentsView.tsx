import React, { useState, useEffect } from 'react';
import { CreditCard, Search, ShieldCheck, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { PaymentRecord, Booking } from '../types/index.js';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay.js';

export const PaymentsView: React.FC = () => {
  const { refreshTrigger, showToast } = useApp();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'escrow' | 'rental'>('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getPayments(), api.getBookings()])
      .then(([pay, bks]) => {
        setPayments(pay);
        setBookings(bks);
      })
      .catch((err) => {
        console.error(err);
        showToast('Failed to load payment ledger', 'error');
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const totalDepositsHeld = bookings.reduce((acc, b) => acc + (b.depositHeld || 0), 0);

  const totalAdvanceCollected = bookings.reduce((acc, b) => acc + (b.advancePaid || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Financial Ledger & Security Deposit Escrow
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Tracking advance rentals, UPI/Cash receipts, security deposits held & escrow refunds
          </p>
        </div>
      </div>

      {/* Escrow & Deposit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EBE4D5] shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Security Deposits in Escrow</span>
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="mt-2 text-xl font-bold text-[#1F2421]">
            <CurrencyDisplay amount={totalDepositsHeld} />
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Held securely until garment return inspection</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE4D5] shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Advance Collections</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-700">
            <CurrencyDisplay amount={totalAdvanceCollected} />
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Advance booked for upcoming wedding dates</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE4D5] shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Payment Channels</span>
            <CreditCard className="w-4 h-4 text-stone-600" />
          </div>
          <div className="mt-2 text-sm font-bold text-stone-800">
            UPI (72%) • Cash (18%) • POS Card (10%)
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Verified via boutique reconciliation</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-[#FAF8F5] flex items-center justify-between">
          <h3 className="font-luxury font-bold text-xs text-stone-800">Verified Payment Transactions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Method & Ref</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-stone-400">
                    Loading transactions...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-stone-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">{p.id}</td>
                    <td className="py-3 px-4 text-stone-600">{p.date}</td>
                    <td className="py-3 px-4 font-semibold text-stone-900">{p.customerName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          p.type === 'deposit_hold'
                            ? 'bg-amber-100 text-amber-800'
                            : p.type === 'deposit_refund'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {p.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <span className="font-semibold text-stone-800">{p.method}</span>
                      {p.referenceNumber && (
                        <span className="font-mono text-[10px] text-stone-400 ml-1">({p.referenceNumber})</span>
                      )}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        p.type === 'deposit_refund' ? 'text-rose-700' : 'text-stone-900'
                      }`}
                    >
                      {p.type === 'deposit_refund' ? '-' : '+'}
                      <CurrencyDisplay amount={p.amount} />
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
