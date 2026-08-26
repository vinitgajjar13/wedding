import React, { useState } from 'react';
import {
  X,
  Calendar,
  User,
  Phone,
  MessageCircle,
  Receipt,
  RotateCcw,
  Scissors,
  CheckCircle,
  Clock,
  Shirt,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/api.js';
import { Booking, BookingStatus } from '../../types/index.js';
import { CurrencyDisplay } from '../common/CurrencyDisplay.js';
import { StatusBadge } from '../common/StatusBadge.js';

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, onClose }) => {
  const { setActiveWhatsAppBooking, setActiveInvoice, openReturnModal, showToast, triggerRefresh } = useApp();
  const [updating, setUpdating] = useState(false);

  if (!booking) return null;

  const handleStatusChange = async (newStatus: BookingStatus) => {
    setUpdating(true);
    try {
      await api.updateBookingStatus(booking.id, newStatus);
      showToast(`Booking updated to ${newStatus}`, 'success');
      triggerRefresh();
      onClose();
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#EBE5DA] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="font-luxury font-bold text-lg text-[#1F2421]">
              Booking: {booking.bookingNumber}
            </div>
            <StatusBadge status={booking.bookingStatus} size="sm" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Customer & Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FCFAF7] p-4 rounded-xl border border-[#EFE8DC] text-xs">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Patron Details
              </span>
              <div className="font-bold text-stone-900 text-sm">{booking.customerName}</div>
              <div className="text-stone-600 mt-0.5">{booking.customerPhone}</div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setActiveWhatsAppBooking({ booking })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Patron
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Event & Lifecycle
              </span>
              <div className="font-bold text-stone-900">{booking.weddingTitle}</div>
              <div className="text-stone-600 mt-1">
                Pickup: <span className="font-semibold text-stone-800">{booking.pickupDate}</span>
              </div>
              <div className="text-stone-600">
                Return Deadline: <span className="font-semibold text-stone-800">{booking.returnDate}</span>
              </div>
            </div>
          </div>

          {/* Reserved Garments */}
          <div className="space-y-3">
            <h4 className="font-luxury font-bold text-sm text-stone-900">
              Reserved Outfits ({booking.items?.length || 0})
            </h4>
            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2 px-3">Garment</th>
                    <th className="py-2 px-3">Piece ID</th>
                    <th className="py-2 px-3">Size</th>
                    <th className="py-2 px-3 text-right">Rental Charge</th>
                    <th className="py-2 px-3 text-right">Deposit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {booking.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">{item.productName}</td>
                      <td className="py-2.5 px-3 font-mono text-stone-600">{item.physicalItemId}</td>
                      <td className="py-2.5 px-3 font-bold text-stone-800">{item.size}</td>
                      <td className="py-2.5 px-3 text-right">
                        <CurrencyDisplay amount={item.rentalPrice} />
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-600">
                        <CurrencyDisplay amount={item.securityDeposit} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="space-y-1.5 text-stone-600">
              <div className="flex justify-between">
                <span>Rental Subtotal:</span>
                <CurrencyDisplay amount={booking.rentalAmount} />
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>- ₹{booking.discount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax:</span>
                <CurrencyDisplay amount={booking.taxAmount} />
              </div>
              <div className="flex justify-between font-bold text-stone-900 border-t border-stone-200 pt-1">
                <span>Total Rental:</span>
                <CurrencyDisplay amount={booking.totalAmount} />
              </div>
            </div>

            <div className="space-y-1.5 text-stone-600 border-l border-stone-200 pl-4">
              <div className="flex justify-between">
                <span>Security Deposit Held:</span>
                <CurrencyDisplay amount={booking.securityDeposit} className="font-bold text-[#9E7B3B]" />
              </div>
              <div className="flex justify-between">
                <span>Advance Paid:</span>
                <CurrencyDisplay amount={booking.advancePaid} className="font-bold text-emerald-700" />
              </div>
              <div className="flex justify-between font-bold text-stone-900 border-t border-stone-200 pt-1">
                <span>Remaining Due:</span>
                <CurrencyDisplay amount={booking.remainingAmount} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#F0ECE1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveInvoice({ type: 'booking', data: booking })}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 rounded-lg shadow-2xs"
            >
              <Receipt className="w-3.5 h-3.5" />
              Tax Invoice
            </button>
            <button
              onClick={() => {
                onClose();
                openReturnModal(booking.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1F2421] hover:bg-black text-xs font-bold text-white rounded-lg shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
              Inspect Return
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Status:</span>
            <select
              value={booking.bookingStatus}
              onChange={(e) => handleStatusChange(e.target.value as BookingStatus)}
              disabled={updating}
              className="text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg outline-none font-semibold text-stone-800"
            >
              <option value="inquiry">Inquiry</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready for Pickup</option>
              <option value="picked_up">Picked Up</option>
              <option value="returned">Returned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
