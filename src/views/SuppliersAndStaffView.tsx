import React, { useState, useEffect } from 'react';
import { Truck, Users, Plus, Phone, MapPin, Shield, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { Supplier, StaffMember } from '../types/index.js';

export const SuppliersAndStaffView: React.FC = () => {
  const { showToast, refreshTrigger, triggerRefresh } = useApp();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'staff'>('suppliers');

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getSuppliers(), api.getStaff()])
      .then(([sups, stf]) => {
        setSuppliers(sups);
        setStaff(stf);
      })
      .catch((err) => {
        console.error(err);
        showToast('Failed to load roster', 'error');
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Artisans, Fabric Suppliers & Showroom Staff
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage fabric mills, embroidery houses, master tailors & boutique sales consultants
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-stone-200 text-xs">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'suppliers' ? 'bg-[#1F2421] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Fabric & Embroidery Suppliers ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'staff' ? 'bg-[#1F2421] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Showroom Staff & Tailors ({staff.length})
          </button>
        </div>
      </div>

      {/* Suppliers Table */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Phone / WhatsApp</th>
                  <th className="py-3 px-4">City / Region</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4">Supplied Categories</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">{s.name}</td>
                    <td className="py-3.5 px-4 text-stone-700">{s.contactPerson}</td>
                    <td className="py-3.5 px-4 text-stone-600 font-mono">{s.phone}</td>
                    <td className="py-3.5 px-4 text-stone-600">{s.city}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">{s.gstin || (s as any).gstNumber || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(s.categories || (s as any).categoriesProvided || []).map((cat: string) => (
                          <span key={cat} className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px]">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Table */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role / Specialization</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {staff.map((st) => (
                  <tr key={st.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">{st.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-800 font-semibold rounded text-[10px] uppercase">
                        {st.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-mono">{st.phone}</td>
                    <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                      {st.permissions?.join(', ') || st.specialization || 'Showroom Operations'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
