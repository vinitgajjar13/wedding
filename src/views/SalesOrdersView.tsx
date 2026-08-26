import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Receipt, CheckCircle, User, CreditCard, X } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { SalesOrder, Customer, Product } from '../types/index.js';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay.js';
import { StatusBadge } from '../components/common/StatusBadge.js';

export const SalesOrdersView: React.FC = () => {
  const { setActiveInvoice, showToast, refreshTrigger, triggerRefresh } = useApp();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);

  // New Sales Order Form State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    api
      .getSalesOrders()
      .then(setOrders)
      .catch((err) => {
        console.error(err);
        showToast('Failed to load sales orders', 'error');
      })
      .finally(() => setLoading(false));

    api.getCustomers().then(setCustomers).catch(console.error);
    api.getProducts({ type: 'sales' }).then(setProducts).catch(console.error);
  }, [refreshTrigger]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    const prod = products.find((p) => p.id === selectedProductId);

    if (!cust || !prod) {
      showToast('Please select customer and product', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const price = prod.salePrice || 5000;
      const subtotal = price * quantity;
      const taxAmount = Math.round((subtotal - discount) * 0.05);
      const finalTotal = subtotal - discount + taxAmount;

      const newOrder = await api.createSalesOrder({
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        items: [
          {
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            size: prod.sizes[0] || 'Standard',
            quantity,
            price,
            total: subtotal,
          },
        ],
        subtotal,
        discount,
        taxAmount,
        finalTotal,
        paymentStatus: 'paid',
        paymentMethod,
        deliveryStatus: 'delivered',
      });

      showToast(`Sales Order ${newOrder.orderNumber} created!`, 'success');
      triggerRefresh();
      setIsNewOrderModalOpen(false);
      setActiveInvoice({ type: 'sale', data: newOrder });
    } catch (err: any) {
      showToast(err.message || 'Failed to create sales order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Direct Retail Sales & Outfits Billing
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Retail sale of wedding wear, accessories, turbans, safas, jewelry & gift items
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F2421] text-white hover:bg-[#323A35] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>+ Create Sales Order</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Sold</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-stone-400">
                    Loading sales orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-stone-400">
                    No sales orders logged yet
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">{o.orderNumber}</td>
                    <td className="py-3.5 px-4 text-stone-600">{o.createdDate}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{o.customerName}</td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {o.items?.map((it: any) => `${it.productName} (x${it.quantity})`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded font-semibold text-[10px]">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-stone-900">
                      <CurrencyDisplay amount={o.finalTotal} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setActiveInvoice({ type: 'sale', data: o })}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors font-mono text-[10px]"
                        title="View Tax Invoice"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sales Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#EBE5DA] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                <h3 className="font-luxury font-bold text-[#1F2421] text-base">New Retail Sales Order</h3>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Customer / Patron *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Garment / Item for Sale *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                >
                  <option value="">-- Choose Item --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Sale: ₹{p.salePrice?.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="Card">Card (POS)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1F2421] hover:bg-black rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Sales Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
