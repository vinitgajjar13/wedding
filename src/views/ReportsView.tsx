import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Sparkles, Shirt, DollarSign, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay.js';

export const ReportsView: React.FC = () => {
  const { showToast, refreshTrigger } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getDashboardStats(), api.getProducts()])
      .then(([st, prods]) => {
        setStats(st);
        setProducts(prods);
      })
      .catch((err) => {
        console.error(err);
        showToast('Failed to load reports', 'error');
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (!stats) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Financial Analytics, Profit & Garment ROI Reports
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Rental yields, direct sales revenue, net profit margin & inventory capital return
          </p>
        </div>
      </div>

      {/* P&L KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EBE4D5] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Total Boutique Revenue</span>
          <div className="mt-2 text-2xl font-bold text-[#1F2421]">
            <CurrencyDisplay amount={stats.totalRevenue} />
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Rental + Retail Outfits</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE4D5] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Total Operational Outflow</span>
          <div className="mt-2 text-2xl font-bold text-rose-700">
            <CurrencyDisplay amount={stats.totalExpenses} />
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Drycleaning, Tailoring & Rent</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE4D5] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Net Boutique Profit</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-800">
            <CurrencyDisplay amount={stats.netProfit} />
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Margin: {Math.round((stats.netProfit / (stats.totalRevenue || 1)) * 100)}%
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE4D5] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Security Deposits in Escrow</span>
          <div className="mt-2 text-2xl font-bold text-[#9E7B3B]">
            <CurrencyDisplay amount={stats.activeEscrowDeposit} />
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Held safely for active bookings</p>
        </div>
      </div>

      {/* Product ROI & Rental Capital Performance Table */}
      <div className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shirt className="w-4 h-4 text-[#C5A059]" />
            <h3 className="font-luxury font-bold text-xs text-stone-800">
              Garment Asset ROI & Rental Yield Performance
            </h3>
          </div>
          <span className="text-[11px] text-stone-500">
            Measures lifetime earnings vs initial purchase acquisition cost
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Garment</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Purchase Cost</th>
                <th className="py-3 px-4 text-right">Rental Fee</th>
                <th className="py-3 px-4 text-center">Times Rented</th>
                <th className="py-3 px-4 text-right">Lifetime Earnings</th>
                <th className="py-3 px-4 text-right">Net ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => {
                const timesRented = p.timesRented || 3;
                const lifetimeEarnings = timesRented * p.rentalPrice;
                const purchaseCost = p.purchaseCost || 25000;
                const roiPct = Math.round(((lifetimeEarnings - purchaseCost) / purchaseCost) * 100);

                return (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">{p.name}</td>
                    <td className="py-3.5 px-4 text-stone-600">{p.category}</td>
                    <td className="py-3.5 px-4 text-right text-stone-600 font-medium">
                      <CurrencyDisplay amount={purchaseCost} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-stone-900">
                      <CurrencyDisplay amount={p.rentalPrice} />
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold font-mono">
                      {timesRented}x
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-800">
                      <CurrencyDisplay amount={lifetimeEarnings} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          roiPct >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {roiPct >= 0 ? `+${roiPct}%` : `${roiPct}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
