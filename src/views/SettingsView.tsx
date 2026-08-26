import React, { useState, useEffect } from 'react';
import { Settings, Store, Save, Shield, Receipt, MessageCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { StoreSettings } from '../types/index.js';

export const SettingsView: React.FC = () => {
  const { language, setLanguage, showToast, refreshTrigger, triggerRefresh } = useApp();
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'VastraVeda Bridal & Groom Studio',
    tagline: 'Couture Indian Wedding Wear Rentals & Bespoke Tailoring',
    address: 'Opp. Rajpath Club, SG Highway, Bodakdev',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380054',
    phone: '+91 98250 12345',
    email: 'contact@vastraveda.in',
    gstin: '24AAAAA0000A1Z5',
    upiId: 'vastraveda@okhdfcbank',
    defaultRentalDays: 3,
    bufferDaysCleaning: 2,
    defaultGstRate: 5,
    defaultSecurityDepositPercent: 50,
    lateFeePerDay: 500,
    termsAndConditions: '1. Garments must be returned on the scheduled return date by 7 PM.\n2. Security deposit is refundable upon pristine inspection.\n3. Alterations are made for temporary fitting only.\n4. Damaged or stained items will incur cleaning/repair charges.',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, [refreshTrigger]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      showToast('Store settings updated successfully!', 'success');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Boutique Settings & Legal Configuration
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Store identity, GSTIN registration, UPI payment handle, default buffers & rental policy
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-7 rounded-2xl border border-[#EBE4D5] shadow-xs space-y-6 text-xs">
        {/* Language Selection */}
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EBE4D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-stone-800 text-xs block">Interface Language</span>
            <span className="text-stone-500 text-[11px]">Select your preferred regional language</span>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-stone-300 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                language === 'en' ? 'bg-[#1F2421] text-white shadow-2xs' : 'text-stone-700'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('gu')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                language === 'gu' ? 'bg-[#1F2421] text-white shadow-2xs' : 'text-stone-700'
              }`}
            >
              ગુજરાતી (Gujarati)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                language === 'hi' ? 'bg-[#1F2421] text-white shadow-2xs' : 'text-stone-700'
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        </div>

        {/* Boutique Profile */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-[#9E7B3B] uppercase tracking-wider">
            Boutique & Showroom Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Store / Boutique Name *</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Store Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">City, State & Pincode</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none"
                />
                <input
                  type="text"
                  value={settings.state}
                  onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none"
                />
                <input
                  type="text"
                  value={settings.pincode}
                  onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Boutique Official Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>

        {/* GST & Payment Parameters */}
        <div className="space-y-4 pt-3 border-t border-stone-200">
          <div className="text-xs font-bold text-[#9E7B3B] uppercase tracking-wider">
            GST & Invoicing Parameters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">GSTIN Number *</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                value={settings.defaultGstRate}
                onChange={(e) => setSettings({ ...settings, defaultGstRate: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">UPI ID for QR Payments</label>
              <input
                type="text"
                value={settings.upiId}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Rental Policies */}
        <div className="space-y-4 pt-3 border-t border-stone-200">
          <div className="text-xs font-bold text-[#9E7B3B] uppercase tracking-wider">
            Rental Buffers & Late Return Policy
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Standard Rental Duration (Days)</label>
              <input
                type="number"
                value={settings.defaultRentalDays}
                onChange={(e) => setSettings({ ...settings, defaultRentalDays: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Drycleaning Buffer (Days)</label>
              <input
                type="number"
                value={settings.bufferDaysCleaning}
                onChange={(e) => setSettings({ ...settings, bufferDaysCleaning: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Late Return Penalty (₹/Day)</label>
              <input
                type="number"
                value={settings.lateFeePerDay}
                onChange={(e) => setSettings({ ...settings, lateFeePerDay: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none font-bold text-rose-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Rental Agreement Terms & Conditions</label>
            <textarea
              rows={4}
              value={settings.termsAndConditions}
              onChange={(e) => setSettings({ ...settings, termsAndConditions: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#1F2421] text-white hover:bg-black text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#C5A059]" />
            <span>{saving ? 'Updating...' : 'Save Boutique Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
