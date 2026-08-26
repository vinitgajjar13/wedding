import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Receipt,
  RotateCcw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { Booking } from '../types/index.js';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { BookingDetailModal } from '../components/bookings/BookingDetailModal.js';
import { NewBookingWizardModal } from '../components/bookings/NewBookingWizardModal.js';

export const BookingsView: React.FC = () => {
  const {
    t,
    setIsNewBookingOpen,
    setActiveWhatsAppBooking,
    setActiveInvoice,
    openReturnModal,
    refreshTrigger,
    showToast,
  } = useApp();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getBookings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      })
      .then(setBookings)
      .catch((err) => {
        console.error(err);
        showToast('Failed to load bookings', 'error');
      })
      .finally(() => setLoading(false));
  }, [statusFilter, searchTerm, refreshTrigger]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Wedding Rental Bookings
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Track rental reservations, pickup dates, alteration readiness, deposits & returns
          </p>
        </div>

        <button
          onClick={() => setIsNewBookingOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F2421] text-white hover:bg-[#323A35] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>+ Create New Booking</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-[#EBE4D5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, booking #, wedding title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-[#FAF8F5] rounded-lg border border-stone-200 text-xs">
          {['all', 'confirmed', 'preparing', 'ready', 'picked_up', 'returned', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors capitalize ${
                statusFilter === st ? 'bg-[#1F2421] text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">Booking #</th>
                <th className="py-3.5 px-4">Customer & Phone</th>
                <th className="py-3.5 px-4">Wedding / Event</th>
                <th className="py-3.5 px-4">Rental Window</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Rental Total</th>
                <th className="py-3.5 px-4 text-right">Deposit Held</th>
                <th className="py-3.5 px-4 text-center">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-stone-400">
                    Loading wedding bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-stone-400">
                    No bookings found matching filters
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {b.bookingNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{b.customerName}</div>
                      <div className="text-[11px] text-stone-500">{b.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-800">{b.weddingTitle}</div>
                      <div className="text-[10px] text-stone-400">
                        {b.items?.length} Garment{b.items?.length > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      <div>From: {b.rentalStartDate}</div>
                      <div className="text-[11px] text-stone-400">Return: {b.returnDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.bookingStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium">
                      <CurrencyDisplay amount={b.totalAmount} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-[#9E7B3B]">
                      <CurrencyDisplay amount={b.securityDeposit} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setActiveWhatsAppBooking({ booking: b })}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          title="Send WhatsApp Update"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setActiveInvoice({ type: 'booking', data: b })}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors font-mono text-[10px]"
                          title="Print Tax Invoice"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openReturnModal(b.id)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#FAF4E6] text-stone-700 hover:text-[#9E7B3B] transition-colors"
                          title="Inspect Return"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      <NewBookingWizardModal />
    </div>
  );
};
