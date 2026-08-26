import React, { useState, useEffect } from 'react';
import {
  Boxes,
  QrCode,
  Search,
  Filter,
  RefreshCw,
  Tag,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Scissors,
  Eye,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { PhysicalInventoryItem, PhysicalItemStatus } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay.js';

export const InventoryView: React.FC = () => {
  const { setActiveQrItem, showToast, refreshTrigger, triggerRefresh } = useApp();

  const [items, setItems] = useState<PhysicalInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<PhysicalInventoryItem | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getInventory({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      })
      .then(setItems)
      .catch((err) => {
        console.error(err);
        showToast('Failed to load physical inventory', 'error');
      })
      .finally(() => setLoading(false));
  }, [statusFilter, searchTerm, refreshTrigger]);

  const handleUpdateStatus = async (itemId: string, newStatus: PhysicalItemStatus) => {
    try {
      await api.updateInventoryItem(itemId, { status: newStatus });
      showToast(`Item ${itemId} status updated to ${newStatus}`, 'success');
      triggerRefresh();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleUpdateLocation = async (itemId: string, newLocation: string) => {
    try {
      await api.updateInventoryItem(itemId, { currentLocation: newLocation });
      showToast(`Item ${itemId} relocated to ${newLocation}`, 'success');
      triggerRefresh();
    } catch (err) {
      showToast('Failed to update location', 'error');
    }
  };

  // Status Counts
  const counts = {
    total: items.length,
    available: items.filter((i) => i.status?.toLowerCase() === 'available').length,
    rented: items.filter((i) => i.status?.toLowerCase() === 'rented' || i.status?.toLowerCase() === 'booked').length,
    cleaning: items.filter((i) => i.status?.toLowerCase() === 'cleaning').length,
    alteration: items.filter((i) => i.status?.toLowerCase() === 'alteration').length,
    repair: items.filter((i) => i.status?.toLowerCase() === 'repair' || (i.condition && i.condition.toLowerCase().includes('damage'))).length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Physical Inventory Piece Tracker
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Tracking individual garments (SH001, LH001) with rack locations, rental lifecycles & QR tags
          </p>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'all'
              ? 'bg-[#1F2421] text-white border-[#1F2421] shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider font-semibold opacity-75">All Pieces</div>
          <div className="text-xl font-extrabold mt-1">{counts.total}</div>
        </button>

        <button
          onClick={() => setStatusFilter('available')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'available'
              ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
              : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50/50'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider font-semibold opacity-75">In Showroom</div>
          <div className="text-xl font-extrabold mt-1">{counts.available}</div>
        </button>

        <button
          onClick={() => setStatusFilter('rented')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'rented'
              ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
              : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50/50'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider font-semibold opacity-75">Rented Out</div>
          <div className="text-xl font-extrabold mt-1">{counts.rented}</div>
        </button>

        <button
          onClick={() => setStatusFilter('cleaning')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'cleaning'
              ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
              : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50/50'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider font-semibold opacity-75">Drycleaning</div>
          <div className="text-xl font-extrabold mt-1">{counts.cleaning}</div>
        </button>

        <button
          onClick={() => setStatusFilter('alteration')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'alteration'
              ? 'bg-orange-900 text-white border-orange-900 shadow-xs'
              : 'bg-white text-orange-800 border-orange-200 hover:bg-orange-50/50'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider font-semibold opacity-75">With Tailor</div>
          <div className="text-xl font-extrabold mt-1">{counts.alteration}</div>
        </button>

        <button
          onClick={() => setStatusFilter('repair')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'repair'
              ? 'bg-rose-900 text-white border-rose-900 shadow-xs'
              : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50/50'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider font-semibold opacity-75">Repair Needed</div>
          <div className="text-xl font-extrabold mt-1">{counts.repair}</div>
        </button>
      </div>

      {/* Search & Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EBE4D5] shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search piece ID (e.g. SH001), SKU, location (Rack A-1)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerRefresh()}
            className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Piece ID</th>
                <th className="py-3 px-4">Garment & SKU</th>
                <th className="py-3 px-4 text-center">Size</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Location / Rack</th>
                <th className="py-3 px-4 text-center">Rental Count</th>
                <th className="py-3 px-4">Quick Status Shift</th>
                <th className="py-3 px-4 text-center">Garment QR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-stone-400">
                    Loading inventory pieces...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-stone-400">
                    No physical pieces matching criteria
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{item.productName || item.sku}</div>
                      <div className="text-[11px] font-mono text-stone-400">SKU: {item.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 bg-[#FAF4E6] text-[#9E7B3B] font-bold rounded text-[11px]">
                        {item.size}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.condition} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-700">
                      {item.currentLocation}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-stone-800">
                      {item.rentalCount} times
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value as PhysicalItemStatus)}
                        className="text-[11px] px-2 py-1 bg-stone-50 border border-stone-200 rounded-md outline-none focus:border-[#C5A059] font-medium"
                      >
                        <option value="available">Mark Available</option>
                        <option value="rented">Mark Rented</option>
                        <option value="cleaning">Send to Cleaning</option>
                        <option value="alteration">Send to Tailor</option>
                        <option value="repair">Mark for Repair</option>
                        <option value="sold">Mark Sold</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setActiveQrItem(item)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#FAF4E6] text-stone-700 hover:text-[#9E7B3B] transition-colors"
                        title="Print / View QR Tag"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
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
