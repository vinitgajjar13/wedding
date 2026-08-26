import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Ruler, Calendar, Clock, CreditCard, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/api.js';
import { Customer } from '../../types/index.js';
import { CurrencyDisplay } from '../common/CurrencyDisplay.js';

interface CustomerDetailModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, onClose }) => {
  const { setCurrentView } = useApp();
  const [fullCustomer, setFullCustomer] = useState<any>(null);

  useEffect(() => {
    if (!customer) return;
    api.getCustomer(customer.id).then(setFullCustomer).catch(console.error);
  }, [customer]);

  if (!customer) return null;
  const c = fullCustomer || customer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#EBE5DA] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#C5A059]" />
            <h3 className="font-luxury font-bold text-[#1F2421] text-base">Patron Profile & Measurement Ledger</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Identity */}
          <div className="flex items-center justify-between p-4 bg-[#FCFAF7] rounded-xl border border-[#EFE8DC]">
            <div>
              <h2 className="font-luxury text-lg font-bold text-stone-900">{c.name}</h2>
              <div className="text-stone-600 mt-1 flex items-center gap-3">
                <span>Phone: {c.phone}</span>
                <span>WhatsApp: {c.whatsapp || c.phone}</span>
              </div>
              <div className="text-stone-500 mt-0.5">{c.address || 'Ahmedabad, Gujarat'}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Lifetime Spend</span>
              <CurrencyDisplay amount={c.totalSpent || 45000} className="text-base font-bold text-stone-900" />
            </div>
          </div>

          {/* Measurements Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <Ruler className="w-4 h-4 text-[#C5A059]" />
                <span>Recorded Measurements (Inches)</span>
              </div>
            </div>

            {c.menMeasurements && (
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                  Men's Tailoring Profile
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-stone-700">
                  <div>Chest: <strong className="text-stone-900">{c.menMeasurements.chest}"</strong></div>
                  <div>Waist: <strong className="text-stone-900">{c.menMeasurements.waist}"</strong></div>
                  <div>Shoulder: <strong className="text-stone-900">{c.menMeasurements.shoulder}"</strong></div>
                  <div>Sleeve: <strong className="text-stone-900">{c.menMeasurements.sleeveLength}"</strong></div>
                  <div>Kurta Length: <strong className="text-stone-900">{c.menMeasurements.kurtaLength}"</strong></div>
                  <div>Sherwani Len: <strong className="text-stone-900">{c.menMeasurements.sherwaniLength}"</strong></div>
                  <div>Pant Length: <strong className="text-stone-900">{c.menMeasurements.pantLength}"</strong></div>
                  <div>Neck: <strong className="text-stone-900">{c.menMeasurements.neck}"</strong></div>
                </div>
              </div>
            )}

            {c.womenMeasurements && (
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                  Women's Bridal Profile
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-stone-700">
                  <div>Bust: <strong className="text-stone-900">{c.womenMeasurements.bust}"</strong></div>
                  <div>Waist: <strong className="text-stone-900">{c.womenMeasurements.waist}"</strong></div>
                  <div>Hip: <strong className="text-stone-900">{c.womenMeasurements.hip}"</strong></div>
                  <div>Blouse Len: <strong className="text-stone-900">{c.womenMeasurements.blouseLength}"</strong></div>
                  <div>Lehenga Len: <strong className="text-stone-900">{c.womenMeasurements.lehengaLength}"</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Bookings History */}
          <div className="space-y-2">
            <div className="font-bold text-stone-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#C5A059]" />
              <span>Rental Booking History ({c.bookings?.length || 0})</span>
            </div>
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2 px-3">Booking #</th>
                    <th className="py-2 px-3">Occasion</th>
                    <th className="py-2 px-3">Dates</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {c.bookings?.map((b: any) => (
                    <tr key={b.id}>
                      <td className="py-2 px-3 font-mono font-bold text-stone-900">{b.bookingNumber}</td>
                      <td className="py-2 px-3">{b.weddingTitle}</td>
                      <td className="py-2 px-3 text-stone-600">{b.rentalStartDate} to {b.returnDate}</td>
                      <td className="py-2 px-3 text-right font-medium">
                        <CurrencyDisplay amount={b.totalAmount} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
