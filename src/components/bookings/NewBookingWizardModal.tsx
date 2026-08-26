import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  User,
  Calendar,
  Shirt,
  Ruler,
  Scissors,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Receipt,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/api.js';
import { Customer, Product, PhysicalInventoryItem, StoreSettings } from '../../types/index.js';
import { CurrencyDisplay } from '../common/CurrencyDisplay.js';

export const NewBookingWizardModal: React.FC = () => {
  const {
    isNewBookingOpen,
    closeBookingWizard,
    preselectedBookingOutfit,
    setActiveInvoice,
    setActiveWhatsAppBooking,
    showToast,
    triggerRefresh,
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isNewCustomerMode, setIsNewCustomerMode] = useState<boolean>(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    city: 'Ahmedabad',
  });

  const [weddingTitle, setWeddingTitle] = useState<string>('Royal Wedding Celebrations');
  const [eventDate, setEventDate] = useState<string>(
    new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]
  );
  const [rentalStartDate, setRentalStartDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [returnDate, setReturnDate] = useState<string>(
    new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0]
  );

  // Selected Booking Items
  const [selectedItems, setSelectedItems] = useState<
    Array<{
      productId: string;
      productName: string;
      physicalItemId: string;
      size: string;
      rentalPrice: number;
      securityDeposit: number;
      eventName: string;
      alterationDetails: string;
    }>
  >([]);

  // Alteration & Tailoring Options
  const [alterationNotes, setAlterationNotes] = useState<string>('Slight fitting on chest & sleeves');
  const [tailorAssigned, setTailorAssigned] = useState<string>('Ramesh Master');

  // Pricing & Payments
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(5);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [depositPaid, setDepositPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  useEffect(() => {
    if (!isNewBookingOpen) return;
    Promise.all([api.getCustomers(), api.getProducts(), api.getSettings()])
      .then(([custs, prods, sets]) => {
        setCustomers(custs);
        setProducts(prods);
        setSettings(sets);
        if (sets?.defaultGstRate) setTaxRate(sets.defaultGstRate);
      })
      .catch(console.error);

    // If pre-selected outfit passed from Smart Availability Finder
    if (preselectedBookingOutfit) {
      const { product, physicalItem, eventDate: preEvent, returnDate: preReturn } = preselectedBookingOutfit;
      if (preEvent) setRentalStartDate(preEvent);
      if (preReturn) setReturnDate(preReturn);

      setSelectedItems([
        {
          productId: product.id,
          productName: product.name,
          physicalItemId: physicalItem?.id || (product as any).physicalItems?.[0]?.id || 'SH001',
          size: physicalItem?.size || product.sizes[0] || '40',
          rentalPrice: product.rentalPrice,
          securityDeposit: product.securityDeposit,
          eventName: 'Wedding Ceremony',
          alterationDetails: '',
        },
      ]);
      setDepositPaid(product.securityDeposit);
      setAdvancePaid(Math.round(product.rentalPrice * 0.5));
    }
  }, [isNewBookingOpen, preselectedBookingOutfit]);

  if (!isNewBookingOpen) return null;

  // Calculation Math
  const rentalSubtotal = selectedItems.reduce((acc, item) => acc + (Number(item.rentalPrice) || 0), 0);
  const totalSecurityDeposit = selectedItems.reduce((acc, item) => acc + (Number(item.securityDeposit) || 0), 0);
  const taxableAmount = Math.max(0, rentalSubtotal - discount);
  const taxAmount = Math.round(taxableAmount * (taxRate / 100));
  const finalRentalTotal = taxableAmount + taxAmount;
  const remainingRentalBalance = Math.max(0, finalRentalTotal - advancePaid);

  const handleAddOutfitItem = (product: Product) => {
    const defaultPiece = (product as any).physicalItems?.[0];
    setSelectedItems([
      ...selectedItems,
      {
        productId: product.id,
        productName: product.name,
        physicalItemId: defaultPiece?.id || 'SH001',
        size: defaultPiece?.size || product.sizes[0] || '40',
        rentalPrice: product.rentalPrice,
        securityDeposit: product.securityDeposit,
        eventName: 'Main Event',
        alterationDetails: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    try {
      let custId = selectedCustomerId;
      let custName = '';
      let custPhone = '';

      if (isNewCustomerMode) {
        if (!newCustomerData.name || !newCustomerData.phone) {
          showToast('Please enter customer name and phone', 'error');
          setSubmitting(false);
          return;
        }
        const createdCust = await api.createCustomer({
          name: newCustomerData.name,
          phone: newCustomerData.phone,
          whatsapp: newCustomerData.whatsapp || newCustomerData.phone,
          city: newCustomerData.city,
        });
        custId = createdCust.id;
        custName = createdCust.name;
        custPhone = createdCust.phone;
      } else {
        const found = customers.find((c) => c.id === selectedCustomerId);
        if (!found) {
          showToast('Please select a customer', 'error');
          setSubmitting(false);
          return;
        }
        custName = found.name;
        custPhone = found.phone;
      }

      if (selectedItems.length === 0) {
        showToast('Please select at least one garment', 'error');
        setSubmitting(false);
        return;
      }

      const bookingPayload = {
        customerId: custId,
        customerName: custName,
        customerPhone: custPhone,
        weddingTitle,
        eventDate,
        rentalStartDate,
        returnDate,
        pickupDate: rentalStartDate,
        items: selectedItems,
        rentalAmount: rentalSubtotal,
        securityDeposit: totalSecurityDeposit,
        discount,
        taxAmount,
        totalAmount: finalRentalTotal,
        advancePaid,
        depositPaid,
        remainingAmount: remainingRentalBalance,
        paymentStatus: advancePaid >= finalRentalTotal ? 'paid' : advancePaid > 0 ? 'partial' : 'pending',
        depositStatus: depositPaid >= totalSecurityDeposit ? 'held' : 'partial',
        alterationsRequired: alterationNotes ? true : false,
        alterationNotes,
        assignedTailor: tailorAssigned,
        createdBy: 'Admin (Boutique Manager)',
      };

      const result = await api.createBooking(bookingPayload);
      setCreatedBooking(result);
      showToast(`Booking ${result.bookingNumber} created successfully!`, 'success');
      triggerRefresh();
      setStep(5); // Success step
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to create booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#EBE5DA] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header & Stepper */}
        <div className="px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <h3 className="font-luxury font-bold text-[#1F2421] text-base">
                New Wedding Rental Booking Wizard
              </h3>
            </div>
            <button
              onClick={closeBookingWizard}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#1F2421]' : ''}`}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 1 ? 'bg-[#1F2421] text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                1
              </span>
              <span>Customer</span>
            </div>
            <span className="text-stone-300">→</span>
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#1F2421]' : ''}`}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 2 ? 'bg-[#1F2421] text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                2
              </span>
              <span>Wedding Dates</span>
            </div>
            <span className="text-stone-300">→</span>
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#1F2421]' : ''}`}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 3 ? 'bg-[#1F2421] text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                3
              </span>
              <span>Outfits & Fit</span>
            </div>
            <span className="text-stone-300">→</span>
            <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-[#1F2421]' : ''}`}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 4 ? 'bg-[#1F2421] text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                4
              </span>
              <span>Deposit & Billing</span>
            </div>
          </div>
        </div>

        {/* Wizard Steps */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* STEP 1: Customer Selection */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-luxury font-bold text-sm text-stone-900">
                  Select or Register Wedding Patron
                </h4>
                <button
                  type="button"
                  onClick={() => setIsNewCustomerMode(!isNewCustomerMode)}
                  className="text-xs font-semibold text-[#9E7B3B] hover:text-[#7C6029]"
                >
                  {isNewCustomerMode ? '← Choose Existing Patron' : '+ Register New Customer'}
                </button>
              </div>

              {isNewCustomerMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#FAF8F5] rounded-xl border border-[#EBE4D5]">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Yashvardhan Singhania"
                      value={newCustomerData.name}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number (+91) *</label>
                    <input
                      type="text"
                      placeholder="9876543210"
                      value={newCustomerData.phone}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      placeholder="Same as phone or enter separate"
                      value={newCustomerData.whatsapp}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, whatsapp: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">City / Region</label>
                    <input
                      type="text"
                      value={newCustomerData.city}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, city: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Select from Registered Patrons</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-white border border-stone-300 rounded-xl outline-none focus:border-[#C5A059]"
                  >
                    <option value="">-- Choose a Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) • {c.city || 'Gujarat'}
                      </option>
                    ))}
                  </select>

                  <p className="text-[11px] text-stone-500 italic mt-1">
                    Patron measurement profiles & rental history will be auto-attached.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Wedding Dates */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="font-luxury font-bold text-sm text-stone-900">
                Wedding Event & Rental Schedule
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Wedding / Occasion Title</label>
                  <input
                    type="text"
                    value={weddingTitle}
                    onChange={(e) => setWeddingTitle(e.target.value)}
                    placeholder="e.g. Singhania & Shah Grand Wedding"
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Rental Pickup Date *</label>
                  <input
                    type="date"
                    value={rentalStartDate}
                    onChange={(e) => setRentalStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Main Event Date *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Scheduled Return Date *</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EBE4D5] text-xs text-stone-600 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>
                  Total Rental Duration:{' '}
                  <strong className="text-stone-900">
                    {Math.max(1, Math.round((new Date(returnDate).getTime() - new Date(rentalStartDate).getTime()) / (1000 * 3600 * 24)))} Days
                  </strong>
                  . Includes 2-day cleaning and alteration buffers.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Outfits & Fit Selection */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-luxury font-bold text-sm text-stone-900">
                  Select Garments & Physical Pieces ({selectedItems.length})
                </h4>
              </div>

              {/* Selected Items List */}
              {selectedItems.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-xl">
                  <Shirt className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">No outfits added yet. Pick from collection below.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-[#FCFAF7] rounded-xl border border-[#EFE8DC] flex items-center justify-between gap-3 text-xs">
                      <div className="flex-1">
                        <div className="font-bold text-stone-900">{item.productName}</div>
                        <div className="text-[11px] text-stone-500">
                          Piece ID: <span className="font-mono font-semibold text-stone-800">{item.physicalItemId}</span> | Size: {item.size}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-stone-900">
                          <CurrencyDisplay amount={item.rentalPrice} />
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Dep: ₹{item.securityDeposit.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Add from Available Catalog */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  + Add Additional Garment from Catalog
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleAddOutfitItem(p)}
                      className="p-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between cursor-pointer transition-colors text-xs"
                    >
                      <div className="truncate mr-2">
                        <div className="font-semibold text-stone-800 truncate">{p.name}</div>
                        <div className="text-[10px] text-stone-400">{p.category}</div>
                      </div>
                      <span className="font-bold text-stone-900 shrink-0">
                        ₹{p.rentalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alterations */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">Alteration & Tailoring Task</span>
                  <select
                    value={tailorAssigned}
                    onChange={(e) => setTailorAssigned(e.target.value)}
                    className="text-xs px-2 py-1 bg-white border border-stone-300 rounded outline-none font-medium"
                  >
                    <option value="Ramesh Master">Master Ramesh</option>
                    <option value="Mukesh Master">Master Mukesh</option>
                    <option value="Kanti Bhai">Kanti Bhai</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Chest -0.5 inch, Lehenga waist elastic adjust"
                  value={alterationNotes}
                  onChange={(e) => setAlterationNotes(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Financials & Deposit */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="font-luxury font-bold text-sm text-stone-900">
                Payment, Discount & Escrow Deposit
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Financial Summary */}
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EBE4D5] space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Rental Subtotal:</span>
                    <CurrencyDisplay amount={rentalSubtotal} />
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Discount:</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-24 text-right px-2 py-1 bg-white border border-stone-300 rounded text-xs"
                    />
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>GST ({taxRate}%):</span>
                    <CurrencyDisplay amount={taxAmount} />
                  </div>
                  <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-200 pt-2">
                    <span>Total Rental Amount:</span>
                    <CurrencyDisplay amount={finalRentalTotal} className="text-base font-bold text-[#1F2421]" />
                  </div>
                  <div className="flex justify-between text-stone-700 border-t border-dashed border-stone-300 pt-2">
                    <span>Security Deposit (Refundable):</span>
                    <CurrencyDisplay amount={totalSecurityDeposit} className="font-bold text-[#9E7B3B]" />
                  </div>
                </div>

                {/* Advance Entry */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Advance Rental Paid Now (₹)</label>
                    <input
                      type="number"
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Security Deposit Paid Now (₹)</label>
                    <input
                      type="number"
                      value={depositPaid}
                      onChange={(e) => setDepositPaid(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                    >
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="Cash">Cash in Hand</option>
                      <option value="Card">Credit / Debit Card (POS)</option>
                      <option value="Bank Transfer">NEFT / RTGS Bank Transfer</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Success & Confirmation */}
          {step === 5 && createdBooking && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-luxury font-bold text-xl text-stone-900">
                  Booking Confirmed: {createdBooking.bookingNumber}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Patron {createdBooking.customerName} has been booked from {createdBooking.rentalStartDate} to {createdBooking.returnDate}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <button
                  onClick={() => setActiveWhatsAppBooking({ booking: createdBooking, defaultType: 'confirmation' })}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send WhatsApp Confirmation
                </button>

                <button
                  onClick={() => setActiveInvoice({ type: 'booking', data: createdBooking })}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1F2421] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Receipt className="w-4 h-4" />
                  Print Tax Invoice & Deposit Receipt
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#F0ECE1] flex items-center justify-between">
          {step <= 4 && (
            <>
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-xl transition-colors disabled:opacity-40"
              >
                ← Back
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2 bg-[#1F2421] text-white hover:bg-[#323A35] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitBooking}
                  className="px-6 py-2.5 bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Confirming...' : 'Finalize & Confirm Booking'}</span>
                </button>
              )}
            </>
          )}

          {step === 5 && (
            <button
              onClick={closeBookingWizard}
              className="w-full py-2.5 bg-[#1F2421] text-white text-xs font-bold rounded-xl"
            >
              Done & Return to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
