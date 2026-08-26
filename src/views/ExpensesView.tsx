import React, { useState, useEffect } from 'react';
import { IndianRupee, Plus, Search, Filter, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { Expense } from '../types/index.js';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay.js';

export const ExpensesView: React.FC = () => {
  const { showToast, refreshTrigger, triggerRefresh } = useApp();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState<boolean>(false);

  // Form State
  const [category, setCategory] = useState<'laundry_dryclean' | 'tailoring' | 'rent' | 'maintenance' | 'packaging' | 'staff' | 'other'>('laundry_dryclean');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [recipient, setRecipient] = useState('Royal Heritage Dry Cleaners');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getExpenses()
      .then(setExpenses)
      .catch((err) => {
        console.error(err);
        showToast('Failed to load expenses', 'error');
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      showToast('Please enter expense title and amount', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createExpense({
        category,
        title,
        amount,
        date: new Date().toISOString().split('T')[0],
        paymentMethod,
        paidTo: recipient,
        recipient,
      });
      showToast('Expense recorded successfully!', 'success');
      triggerRefresh();
      setIsNewExpenseOpen(false);
      setTitle('');
    } catch (err: any) {
      showToast(err.message || 'Failed to record expense', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Operational Expenses & Drycleaning Ledger
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Track garment laundry, tailoring wages, showroom rent, packaging & maintenance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Total Outflow</span>
            <CurrencyDisplay amount={totalExpense} className="text-base font-bold text-rose-700" />
          </div>
          <button
            onClick={() => setIsNewExpenseOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F2421] text-white hover:bg-[#323A35] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>+ Record Expense</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Expense Description</th>
                <th className="py-3 px-4">Recipient / Vendor</th>
                <th className="py-3 px-4">Payment Channel</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-stone-400">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-stone-400">
                    No expenses logged yet
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-stone-600 font-mono">{e.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded font-semibold text-[10px] uppercase">
                        {e.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">{e.title}</td>
                    <td className="py-3.5 px-4 text-stone-600">{e.recipient || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-stone-700">{e.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-rose-700">
                      <CurrencyDisplay amount={e.amount} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isNewExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#EBE5DA] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-[#C5A059]" />
                <h3 className="font-luxury font-bold text-[#1F2421] text-base">Record Operational Expense</h3>
              </div>
              <button
                onClick={() => setIsNewExpenseOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Expense Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                >
                  <option value="laundry_dryclean">Garment Drycleaning & Steam Press</option>
                  <option value="tailoring">Master Tailor Wages & Alterations</option>
                  <option value="rent">Showroom / Boutique Rent</option>
                  <option value="packaging">Luxury Garment Bags & Hangers</option>
                  <option value="maintenance">Maintenance & Repairs</option>
                  <option value="staff">Staff Salary / Tea & Snacks</option>
                  <option value="other">Other Operational</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drycleaning for 8 Sherwanis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank NEFT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="e.g. Master Ramesh Tailor"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewExpenseOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1F2421] hover:bg-black rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
