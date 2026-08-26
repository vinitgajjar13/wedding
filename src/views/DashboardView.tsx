import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Shirt,
  Scissors,
  Users,
  CreditCard,
  MessageCircle,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { Booking, PhysicalInventoryItem, Product } from '../types/index.js';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay.js';
import { StatusBadge } from '../components/common/StatusBadge.js';

export const DashboardView: React.FC = () => {
  const {
    t,
    setCurrentView,
    setIsNewBookingOpen,
    openReturnModal,
    setActiveWhatsAppBooking,
    setActiveInvoice,
    setActiveQrItem,
    refreshTrigger,
    showToast,
  } = useApp();

  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quickDateQuery, setQuickDateQuery] = useState({
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    category: 'Sherwani',
    size: '42',
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getReportsSummary(), api.getBookings(), api.getProducts()])
      .then(([summary, bks, prods]) => {
        setSummaryData(summary);
        setBookings(bks);
        setProducts(prods);
      })
      .catch((err) => {
        console.error(err);
        showToast('Error loading dashboard data', 'error');
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const kpis = summaryData?.kpis || {};
  const overdueBookings = summaryData?.overdueBookings || [];

  // Low availability alert products (0 or 1 piece left available)
  const lowStockProducts = products.filter((p: any) => (p.availableCount || 0) <= 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner: Indian Wedding Season Insights */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1F2421] via-[#2A312D] to-[#1F2421] rounded-2xl text-white shadow-md border border-[#3A443F] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#C5A059] text-[#1F2421] font-bold text-[10px] uppercase tracking-wider rounded">
              Shubh Muhurat Active
            </span>
            <span className="text-xs text-stone-300">Wedding Season Peak Bookings</span>
          </div>
          <h2 className="font-luxury text-xl sm:text-2xl font-bold tracking-wide text-white">
            Namaste! Welcome to VastraVeda Atelier
          </h2>
          <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
            Manage your bridal lehengas, groom sherwanis, live date overlaps, escrow security deposits, and dryclean cycles seamlessly.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => setCurrentView('availability')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C5A059] text-[#1F2421] hover:bg-[#D8B46C] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Check Live Dates
          </button>
          <button
            onClick={() => setIsNewBookingOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            + New Booking
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (8 Key Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EBE4D5] shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">{t('monthlyRevenue')}</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF4E6] flex items-center justify-center text-[#9E7B3B]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <CurrencyDisplay
              amount={kpis.totalRevenue || 0}
              className="text-xl sm:text-2xl font-extrabold text-[#1F2421]"
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500">
            <span>Rental: ₹{(kpis.totalRentalRevenue || 0).toLocaleString('en-IN')}</span>
            <span className="text-emerald-700 font-semibold">Net P&L: ₹{(kpis.estimatedNetProfit || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Metric 2: Active Rentals */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EBE4D5] shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">{t('activeRentals')}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-stone-900">
            {kpis.activeRentalsCount || 0}{' '}
            <span className="text-xs font-normal text-stone-500">outfits with patrons</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500 flex justify-between">
            <span>Available in store:</span>
            <span className="font-semibold text-stone-800">{kpis.availablePiecesCount || 0} pieces</span>
          </div>
        </div>

        {/* Metric 3: Security Deposit in Escrow */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EBE4D5] shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">{t('depositHeld')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <CurrencyDisplay
              amount={kpis.totalSecurityDepositHeld || 0}
              className="text-xl sm:text-2xl font-extrabold text-emerald-900"
            />
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            Refunded upon inspection: ₹{(kpis.totalDepositRefunded || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Metric 4: Overdue Returns Alert */}
        <div
          onClick={() => overdueBookings.length > 0 && openReturnModal()}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            overdueBookings.length > 0
              ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-50'
              : 'bg-white border-[#EBE4D5] hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-600">{t('overdueRentals')}</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                overdueBookings.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-500'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-stone-900">
            {overdueBookings.length}{' '}
            <span className="text-xs font-normal text-stone-500">late returns</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-700 font-medium">
            {overdueBookings.length > 0 ? 'Click to inspect & charge late fee' : 'All returns on schedule'}
          </div>
        </div>
      </div>

      {/* Secondary Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setCurrentView('alterations')}
          className="bg-white p-3.5 rounded-xl border border-stone-200/80 flex items-center justify-between cursor-pointer hover:border-stone-300 transition-colors"
        >
          <div>
            <div className="text-[11px] text-stone-500">Pending Alterations</div>
            <div className="text-base font-bold text-stone-800">{kpis.pendingAlterationsCount || 0} tasks</div>
          </div>
          <Scissors className="w-4 h-4 text-orange-500" />
        </div>

        <div
          onClick={() => setCurrentView('inventory')}
          className="bg-white p-3.5 rounded-xl border border-stone-200/80 flex items-center justify-between cursor-pointer hover:border-stone-300 transition-colors"
        >
          <div>
            <div className="text-[11px] text-stone-500">Cleaning / Laundry</div>
            <div className="text-base font-bold text-stone-800">{kpis.cleaningPiecesCount || 0} pieces</div>
          </div>
          <RotateCcw className="w-4 h-4 text-purple-500" />
        </div>

        <div
          onClick={() => setCurrentView('inventory')}
          className="bg-white p-3.5 rounded-xl border border-stone-200/80 flex items-center justify-between cursor-pointer hover:border-stone-300 transition-colors"
        >
          <div>
            <div className="text-[11px] text-stone-500">Repair Required</div>
            <div className="text-base font-bold text-stone-800">{kpis.repairPiecesCount || 0} pieces</div>
          </div>
          <Shirt className="w-4 h-4 text-amber-500" />
        </div>

        <div
          onClick={() => setCurrentView('customers')}
          className="bg-white p-3.5 rounded-xl border border-stone-200/80 flex items-center justify-between cursor-pointer hover:border-stone-300 transition-colors"
        >
          <div>
            <div className="text-[11px] text-stone-500">Active Patrons</div>
            <div className="text-base font-bold text-stone-800">45 Registered</div>
          </div>
          <Users className="w-4 h-4 text-blue-500" />
        </div>
      </div>

      {/* Main Grid: Live Bookings & Quick Outfit Checker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#F0ECE1] flex items-center justify-between bg-[#FAF8F5]">
            <div>
              <h3 className="font-luxury font-bold text-[#1F2421] text-base">Active Wedding Bookings</h3>
              <p className="text-xs text-stone-500">Recent rental reservations, pickup dates & lifecycle</p>
            </div>
            <button
              onClick={() => setCurrentView('bookings')}
              className="text-xs font-semibold text-[#9E7B3B] hover:text-[#7A5D2A] inline-flex items-center gap-1"
            >
              View All ({bookings.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FCFAF7] text-stone-600 font-semibold border-b border-stone-100">
                <tr>
                  <th className="py-3 px-4">Booking #</th>
                  <th className="py-3 px-4">Customer & Event</th>
                  <th className="py-3 px-4">Rental Window</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Rental Total</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.slice(0, 6).map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-800">
                      {b.bookingNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{b.customerName}</div>
                      <div className="text-[11px] text-[#9E7B3B] font-medium">{b.weddingTitle}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      <div>{b.rentalStartDate}</div>
                      <div className="text-[11px] text-stone-400">Return: {b.returnDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.bookingStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium">
                      <CurrencyDisplay amount={b.totalAmount} />
                      <div className="text-[10px] text-stone-400">
                        Deposit: ₹{b.securityDeposit.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActiveWhatsAppBooking({ booking: b })}
                          title="Send WhatsApp update"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setActiveInvoice({ type: 'booking', data: b })}
                          title="View Tax Invoice & Deposit receipt"
                          className="p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors font-mono text-[10px]"
                        >
                          INV
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Quick Smart Availability Card + Low Stock Watch */}
        <div className="space-y-6">
          {/* Quick Date Query Box */}
          <div className="bg-[#FCFAF7] p-5 rounded-2xl border border-[#EAE3D2] shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <h3 className="font-luxury font-bold text-sm text-[#1F2421]">
                Quick Outfit Availability
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              "20 Nov wedding mate size 42 ma kai sherwani available che?"
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Wedding Event Date
                </label>
                <input
                  type="date"
                  value={quickDateQuery.date}
                  onChange={(e) => setQuickDateQuery({ ...quickDateQuery, date: e.target.value })}
                  aria-label="Wedding Event Date"
                  className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Category</label>
                  <select
                    value={quickDateQuery.category}
                    onChange={(e) => setQuickDateQuery({ ...quickDateQuery, category: e.target.value })}
                    aria-label="Outfit Category"
                    className="w-full text-xs px-2.5 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                  >
                    <option value="Sherwani">Sherwani</option>
                    <option value="Bridal & Designer Lehenga">Bridal Lehenga</option>
                    <option value="Indo-Western">Indo-Western</option>
                    <option value="Bandhgala & Jodhpuri">Bandhgala</option>
                    <option value="Kurta Jacket & Haldi Set">Haldi Set</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Size</label>
                  <select
                    value={quickDateQuery.size}
                    onChange={(e) => setQuickDateQuery({ ...quickDateQuery, size: e.target.value })}
                    aria-label="Outfit Size"
                    className="w-full text-xs px-2.5 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                  >
                    <option value="38">38 (M)</option>
                    <option value="40">40 (L)</option>
                    <option value="42">42 (XL)</option>
                    <option value="44">44 (XXL)</option>
                    <option value="S">S (Women)</option>
                    <option value="M">M (Women)</option>
                    <option value="L">L (Women)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setCurrentView('availability')}
                className="w-full py-2.5 bg-[#1F2421] text-white hover:bg-[#303833] text-xs font-bold rounded-xl shadow-xs transition-colors mt-2"
              >
                Search Available Outfits →
              </button>
            </div>
          </div>

          {/* Low Stock Watch */}
          <div className="bg-white p-5 rounded-2xl border border-[#EBE4D5] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h4 className="font-luxury font-bold text-xs text-stone-800">High Demand Garments</h4>
              </div>
              <span className="text-[10px] text-stone-400">Available count</span>
            </div>

            <div className="space-y-2.5">
              {lowStockProducts.slice(0, 3).map((prod: any) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-9 h-9 rounded-md object-cover border border-stone-200 shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-stone-900 truncate">{prod.name}</div>
                      <div className="text-[10px] text-stone-500">{prod.category}</div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      prod.availableCount === 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {prod.availableCount === 0 ? '0 Left (All Rented)' : '1 Left'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
