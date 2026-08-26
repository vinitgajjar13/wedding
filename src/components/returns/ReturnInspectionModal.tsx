import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Shirt,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/api.js';
import { Booking, ItemCondition, PhysicalItemStatus } from '../../types/index.js';
import { CurrencyDisplay } from '../common/CurrencyDisplay.js';
import { StatusBadge } from '../common/StatusBadge.js';

export const ReturnInspectionModal: React.FC = () => {
  const {
    isReturnModalOpen,
    closeReturnModal,
    preselectedReturnBookingId,
    setActiveWhatsAppBooking,
    showToast,
    triggerRefresh,
  } = useApp();

  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Return Inspection State
  const [actualReturnDate, setActualReturnDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [itemInspections, setItemInspections] = useState<
    Array<{
      physicalItemId: string;
      productName: string;
      condition: ItemCondition;
      nextStatus: PhysicalItemStatus;
      damageNotes: string;
    }>
  >([]);

  const [damageFee, setDamageFee] = useState<number>(0);
  const [lateFeePerDay, setLateFeePerDay] = useState<number>(500);
  const [customLateFee, setCustomLateFee] = useState<number | null>(null);
  const [refundMethod, setRefundMethod] = useState<string>('UPI');
  const [inspectionNotes, setInspectionNotes] = useState<string>('Garment inspected by store manager.');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isReturnModalOpen) return;
    api.getBookings().then((bks) => {
      const eligible = bks.filter(
        (b) =>
          b.bookingStatus === 'Picked Up' ||
          b.bookingStatus === 'Active Rental' ||
          b.bookingStatus === 'Confirmed' ||
          b.bookingStatus === 'Ready' ||
          (b.bookingStatus as string) === 'picked_up'
      );
      setActiveBookings(eligible);

      const targetId = preselectedReturnBookingId || (eligible.length > 0 ? eligible[0].id : '');
      setSelectedBookingId(targetId);
    });
  }, [isReturnModalOpen, preselectedReturnBookingId]);

  useEffect(() => {
    if (!selectedBookingId) {
      setSelectedBooking(null);
      return;
    }
    api.getBooking(selectedBookingId).then((bk) => {
      setSelectedBooking(bk);
      if (bk.items) {
        setItemInspections(
          bk.items.map((it: any) => ({
            physicalItemId: it.physicalItemId,
            productName: it.productName,
            condition: 'excellent' as ItemCondition,
            nextStatus: 'cleaning' as PhysicalItemStatus,
            damageNotes: '',
          }))
        );
      }
    });
  }, [selectedBookingId]);

  if (!isReturnModalOpen) return null;

  // Late calculation
  let lateDays = 0;
  if (selectedBooking?.returnDate && actualReturnDate) {
    const scheduled = new Date(selectedBooking.returnDate);
    const actual = new Date(actualReturnDate);
    const diffTime = actual.getTime() - scheduled.getTime();
    lateDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const calculatedLateFee = customLateFee !== null ? customLateFee : lateDays * lateFeePerDay;
  const depositHeld = selectedBooking?.securityDeposit || 0;
  const totalDeductions = calculatedLateFee + damageFee;
  const netDepositRefund = Math.max(0, depositHeld - totalDeductions);
  const extraPayable = totalDeductions > depositHeld ? totalDeductions - depositHeld : 0;

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) {
      showToast('Please select a booking to process return', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.processReturn({
        bookingId: selectedBooking.id,
        returnDate: actualReturnDate,
        itemsInspected: itemInspections,
        lateDays,
        lateFeeCharged: calculatedLateFee,
        damageFeeCharged: damageFee,
        depositRefunded: netDepositRefund,
        refundPaymentMethod: refundMethod,
        inspectorName: 'Store Manager',
        notes: inspectionNotes,
      });

      showToast(`Return processed! Escrow Refund: ₹${netDepositRefund.toLocaleString('en-IN')}`, 'success');
      triggerRefresh();
      closeReturnModal();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to process return', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#EBE5DA] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#C5A059]" />
            <h3 className="font-luxury font-bold text-[#1F2421] text-base">
              Garment Return & Escrow Inspection
            </h3>
          </div>
          <button
            onClick={closeReturnModal}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmitReturn} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Booking Picker */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Select Active Rental Booking *
            </label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-white border border-stone-300 rounded-xl outline-none focus:border-[#C5A059] font-medium"
            >
              <option value="">-- Select Active Booking --</option>
              {activeBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bookingNumber} - {b.customerName} ({b.weddingTitle}) • Due: {b.returnDate}
                </option>
              ))}
            </select>
          </div>

          {selectedBooking && (
            <>
              {/* Return Date & Late check */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#FAF8F5] rounded-xl border border-[#EBE4D5] text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Scheduled Return Date
                  </label>
                  <div className="font-bold text-stone-900">{selectedBooking.returnDate}</div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Actual Return Handover Date *
                  </label>
                  <input
                    type="date"
                    value={actualReturnDate}
                    onChange={(e) => setActualReturnDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg outline-none"
                  />
                </div>

                {lateDays > 0 && (
                  <div className="sm:col-span-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>
                        Return is <strong>{lateDays} Day{lateDays > 1 ? 's' : ''} Late</strong> (Standard ₹{lateFeePerDay}/day)
                      </span>
                    </div>
                    <span className="font-bold font-mono">₹{calculatedLateFee} Late Fee</span>
                  </div>
                )}
              </div>

              {/* Garments Physical Inspection */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-stone-800">
                  Individual Garment Inspection & Next Workflow
                </label>

                {itemInspections.map((item, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900">{item.productName}</span>
                        <span className="ml-2 font-mono text-[11px] text-stone-500">[{item.physicalItemId}]</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-stone-500 block mb-0.5">Condition:</span>
                        <select
                          value={item.condition}
                          onChange={(e) => {
                            const updated = [...itemInspections];
                            updated[idx].condition = e.target.value as ItemCondition;
                            setItemInspections(updated);
                          }}
                          className="w-full text-xs px-2 py-1.5 bg-white border border-stone-300 rounded-md outline-none"
                        >
                          <option value="excellent">Excellent (Pristine)</option>
                          <option value="good">Good (Normal wear)</option>
                          <option value="minor_damage">Minor Damage (Stain/Loose stitch)</option>
                          <option value="major_damage">Major Damage (Torn/Burn)</option>
                          <option value="lost">Lost / Missing</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-500 block mb-0.5">Dispatch Garment to:</span>
                        <select
                          value={item.nextStatus}
                          onChange={(e) => {
                            const updated = [...itemInspections];
                            updated[idx].nextStatus = e.target.value as PhysicalItemStatus;
                            setItemInspections(updated);
                          }}
                          className="w-full text-xs px-2 py-1.5 bg-white border border-stone-300 rounded-md outline-none font-semibold text-stone-800"
                        >
                          <option value="cleaning">Send to Drycleaning (2 Days)</option>
                          <option value="repair">Send to Master Tailor Repair</option>
                          <option value="available">Ready & Back in Showroom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Deductions & Deposit Escrow Math */}
              <div className="p-4 bg-[#FCFAF7] rounded-xl border border-[#EFE8DC] space-y-3 text-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#9E7B3B]">
                  <ShieldCheck className="w-4 h-4" />
                  Security Deposit Settlement Ledger
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-stone-600">
                    <span>Security Deposit Held in Escrow:</span>
                    <CurrencyDisplay amount={depositHeld} className="font-bold text-stone-900" />
                  </div>

                  <div className="flex justify-between items-center text-stone-600">
                    <span>Late Return Fee Charged:</span>
                    <input
                      type="number"
                      value={calculatedLateFee}
                      onChange={(e) => setCustomLateFee(Number(e.target.value))}
                      className="w-24 text-right px-2 py-1 bg-white border border-stone-300 rounded text-xs text-rose-700 font-bold"
                    />
                  </div>

                  <div className="flex justify-between items-center text-stone-600">
                    <span>Damage / Dryclean Repair Deduction:</span>
                    <input
                      type="number"
                      value={damageFee}
                      onChange={(e) => setDamageFee(Number(e.target.value))}
                      className="w-24 text-right px-2 py-1 bg-white border border-stone-300 rounded text-xs text-rose-700 font-bold"
                    />
                  </div>

                  <div className="flex justify-between text-sm font-bold text-emerald-900 border-t border-stone-200 pt-2 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
                    <span>Net Deposit Refund to Patron:</span>
                    <CurrencyDisplay amount={netDepositRefund} className="text-base font-extrabold text-emerald-800" />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Refund Payout Channel
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg outline-none"
                  >
                    <option value="UPI">UPI Instant (Google Pay / PhonePe)</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Bank Transfer">Bank NEFT Transfer</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Footer actions */}
          <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeReturnModal}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedBooking}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1F2421] hover:bg-black rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'Processing Inspection...' : 'Confirm Return & Refund Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
