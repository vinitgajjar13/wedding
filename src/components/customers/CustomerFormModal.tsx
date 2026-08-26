import React, { useState } from 'react';
import { X, User, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/api.js';

export const CustomerFormModal: React.FC = () => {
  const { isNewCustomerOpen, setIsNewCustomerOpen, showToast, triggerRefresh } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: 'Ahmedabad',
    weddingDate: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  if (!isNewCustomerOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast('Please enter customer name and phone', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createCustomer({
        ...formData,
        whatsapp: formData.whatsapp || formData.phone,
      });
      showToast('Customer registered successfully!', 'success');
      triggerRefresh();
      setIsNewCustomerOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to create customer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#EBE5DA] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#C5A059]" />
            <h3 className="font-luxury font-bold text-[#1F2421] text-base">Register Wedding Patron</h3>
          </div>
          <button
            onClick={() => setIsNewCustomerOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Patron Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Radhika Merchant"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Phone Number (+91) *</label>
              <input
                type="text"
                required
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                placeholder="Leave blank if same as phone"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">City / Region</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Upcoming Wedding Date</label>
              <input
                type="date"
                value={formData.weddingDate}
                onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Address / Venue</label>
              <input
                type="text"
                placeholder="Bespoke delivery location..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewCustomerOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1F2421] hover:bg-black rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Patron'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
