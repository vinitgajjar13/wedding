import React, { useEffect, useState } from 'react';
import { X, Printer, Download, Sparkles, Receipt, CheckCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/api.js';
import { StoreSettings } from '../../types/index.js';
import { CurrencyDisplay } from './CurrencyDisplay.js';

export const InvoiceModal: React.FC = () => {
  const { activeInvoice, setActiveInvoice } = useApp();
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  if (!activeInvoice) return null;

  const { type, data } = activeInvoice;
  const isBooking = type === 'booking';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#EBE5DA] overflow-hidden my-6">
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#F0ECE1] bg-[#FAF8F5] no-print">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#C5A059]" />
            <span className="font-luxury font-bold text-[#1F2421] text-sm">
              {isBooking ? `Rental Tax Invoice & Deposit Ledger: ${data.bookingNumber}` : `Sales Invoice: ${data.orderNumber}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1F2421] hover:bg-black rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={() => setActiveInvoice(null)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Content */}
        <div className="p-8 text-stone-900 font-sans" id="printable-invoice">
          {/* Brand Header */}
          <div className="flex justify-between items-start border-b border-stone-200 pb-6 mb-6">
            <div>
              <div className="font-luxury text-2xl font-bold tracking-wider text-[#1F2421]">
                {settings?.businessName || 'VASTRAVEDA'}
              </div>
              <div className="text-xs text-[#9E7B3B] font-medium uppercase tracking-widest mt-0.5">
                {settings?.tagline || 'Bespoke Wedding Wear & Rental Atelier'}
              </div>
              <p className="text-xs text-stone-500 mt-2 max-w-xs leading-relaxed">
                {settings?.address || '101-104 Shivalik Highstreet, Bodakdev, Ahmedabad, Gujarat 380054'}
              </p>
              <p className="text-xs text-stone-600 mt-1 font-mono">
                GSTIN: <span className="font-bold text-stone-800">{settings?.gstin || '24AAFCV9821L1Z4'}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-[#FAF4E6] text-[#9E7B3B] text-xs font-bold uppercase rounded-md tracking-wider border border-[#EBDCB9] mb-2">
                {isBooking ? 'TAX INVOICE / RENTAL AGREEMENT' : 'RETAIL TAX INVOICE'}
              </div>
              <div className="text-xs text-stone-500">Invoice No:</div>
              <div className="text-sm font-bold text-stone-900 font-mono">
                {isBooking ? `INV-${data.bookingNumber}` : `INV-${data.orderNumber}`}
              </div>
              <div className="text-xs text-stone-500 mt-1">Date: {data.createdDate || new Date().toISOString().split('T')[0]}</div>
              {isBooking && (
                <div className="text-xs text-stone-600 mt-1">
                  Rental Period: <span className="font-medium">{data.rentalStartDate} to {data.rentalEndDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Billed To Customer */}
          <div className="grid grid-cols-2 gap-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#F0ECE1] mb-6 text-xs">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Customer / Patron</span>
              <div className="font-bold text-stone-900 text-sm">{data.customerName}</div>
              <div className="text-stone-600 mt-0.5">{data.customerPhone}</div>
              {data.deliveryAddress && <div className="text-stone-500 mt-1">{data.deliveryAddress}</div>}
            </div>
            <div>
              {isBooking ? (
                <>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Wedding / Occasion</span>
                  <div className="font-bold text-stone-900">{data.weddingTitle || 'Royal Wedding Celebrations'}</div>
                  <div className="text-stone-600 mt-0.5">Pickup: <span className="font-semibold text-stone-800">{data.pickupDate}</span></div>
                  <div className="text-stone-600">Return By: <span className="font-semibold text-stone-800">{data.returnDate}</span></div>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Sales Info</span>
                  <div className="text-stone-700">Payment: <span className="font-semibold">{data.paymentMethod}</span></div>
                  <div className="text-stone-700">Delivery: <span className="font-semibold capitalize">{data.deliveryStatus}</span></div>
                </>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Garment / Outfit Description</th>
                  <th className="py-2.5 px-4 text-center">Piece / SKU</th>
                  <th className="py-2.5 px-4 text-center">Size</th>
                  <th className="py-2.5 px-4 text-right">{isBooking ? 'Rental Charge' : 'Price'}</th>
                  {isBooking && <th className="py-2.5 px-4 text-right">Security Deposit</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {data.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-3 px-4 font-mono text-stone-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{item.productName}</div>
                      {item.eventName && (
                        <span className="text-[11px] text-[#9E7B3B] font-medium">Event: {item.eventName}</span>
                      )}
                      {item.alterationDetails && (
                        <div className="text-[11px] text-stone-500 italic">Alteration: {item.alterationDetails}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-stone-600">
                      {item.physicalItemId || item.sku || '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-stone-700">
                      {item.size}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      <CurrencyDisplay amount={item.rentalPrice || item.price} />
                    </td>
                    {isBooking && (
                      <td className="py-3 px-4 text-right font-medium text-stone-600">
                        <CurrencyDisplay amount={item.securityDeposit || 0} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation & Tax Summary */}
          <div className="grid grid-cols-2 gap-6 items-start text-xs border-t border-stone-200 pt-4">
            <div className="space-y-3">
              <div className="p-3 bg-[#FCFAF7] rounded-lg border border-[#EFE8DA]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#9E7B3B] mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  Security Deposit Escrow Policy
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Security deposits are held in dedicated store escrow and refunded upon return garment inspection. Late returns attract ₹{settings?.lateFeePerDay || 500}/day.
                </p>
              </div>

              <div className="text-[11px] text-stone-500">
                <span className="font-semibold text-stone-700">UPI Payments Accepted:</span> {settings?.upiId || 'vastraveda@okhdfcbank'}
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({isBooking ? 'Rental' : 'Goods'}):</span>
                <CurrencyDisplay amount={isBooking ? data.rentalAmount : data.subtotal} />
              </div>
              {data.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Special Discount:</span>
                  <span>- ₹{data.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>GST ({data.taxRate || 5}%):</span>
                <CurrencyDisplay amount={data.taxAmount} />
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-200 pt-2">
                <span>Total Amount:</span>
                <CurrencyDisplay amount={data.totalAmount || data.finalTotal} className="text-base font-bold text-[#1F2421]" />
              </div>

              {isBooking && (
                <>
                  <div className="flex justify-between text-stone-600 border-t border-dashed border-stone-200 pt-2">
                    <span>Security Deposit Held:</span>
                    <CurrencyDisplay amount={data.securityDeposit} className="font-semibold text-[#9E7B3B]" />
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>Advance Amount Paid:</span>
                    <CurrencyDisplay amount={data.advancePaid} className="font-medium text-emerald-700" />
                  </div>
                  <div className="flex justify-between text-stone-900 font-bold bg-white p-2 rounded border border-stone-200">
                    <span>Balance Due on Pickup:</span>
                    <CurrencyDisplay amount={data.remainingAmount} className="text-stone-900 font-bold" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Terms & Signature */}
          <div className="mt-8 pt-4 border-t border-stone-200 grid grid-cols-2 gap-6 text-[10px] text-stone-500">
            <div>
              <div className="font-bold text-stone-700 uppercase mb-1">Terms & Conditions:</div>
              <p className="whitespace-pre-line leading-relaxed">{settings?.termsAndConditions || 'Outfits are inspected before delivery.'}</p>
            </div>
            <div className="text-right flex flex-col justify-end">
              <div className="h-10"></div>
              <div className="border-t border-stone-400 inline-block pt-1 text-stone-700 font-medium font-luxury">
                Authorized Signatory, {settings?.businessName || 'VastraVeda Atelier'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
