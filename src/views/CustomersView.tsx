import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Eye, Phone, MessageCircle, Ruler, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { Customer } from '../types/index.js';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay.js';
import { CustomerDetailModal } from '../components/customers/CustomerDetailModal.js';
import { CustomerFormModal } from '../components/customers/CustomerFormModal.js';

export const CustomersView: React.FC = () => {
  const { setIsNewCustomerOpen, refreshTrigger, showToast } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getCustomers(searchTerm)
      .then(setCustomers)
      .catch((err) => {
        console.error(err);
        showToast('Failed to load customers', 'error');
      })
      .finally(() => setLoading(false));
  }, [searchTerm, refreshTrigger]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Wedding Patrons & Customer CRM
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Maintain client directories, wedding dates, tailoring measurements & rental history
          </p>
        </div>

        <button
          onClick={() => setIsNewCustomerOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F2421] text-white hover:bg-[#323A35] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>+ Register New Patron</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EBE4D5] shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by patron name, phone, city..."
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
                <th className="py-3 px-4">Patron Name</th>
                <th className="py-3 px-4">Phone / WhatsApp</th>
                <th className="py-3 px-4">City / Region</th>
                <th className="py-3 px-4">Upcoming Wedding</th>
                <th className="py-3 px-4 text-center">Measurements</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-stone-400">
                    Loading patrons...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-stone-400">
                    No patrons found
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">{c.name}</td>
                    <td className="py-3.5 px-4 text-stone-600 font-mono">
                      <div>{c.phone}</div>
                      {c.whatsapp && c.whatsapp !== c.phone && (
                        <div className="text-[10px] text-emerald-700 font-sans">WA: {c.whatsapp}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">{c.city || 'Ahmedabad'}</td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {c.weddingDate ? (
                        <span className="font-semibold text-stone-800">{c.weddingDate}</span>
                      ) : (
                        <span className="text-stone-400 italic">Not set</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {c.menMeasurements || c.womenMeasurements ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                          Recorded
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded text-[10px]">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium">
                      <CurrencyDisplay amount={c.totalSpent || 0} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#FAF4E6] text-stone-700 hover:text-[#9E7B3B] transition-colors"
                        title="View Profile & Measurements"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerDetailModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      <CustomerFormModal />
    </div>
  );
};
