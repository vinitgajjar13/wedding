import React, { useState, useEffect } from 'react';
import { Ruler, User, Save, Sparkles, CheckCircle2, History, Shirt } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { Customer, MenMeasurements, WomenMeasurements } from '../types/index.js';

export const MeasurementsView: React.FC = () => {
  const { showToast, refreshTrigger } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [genderMode, setGenderMode] = useState<'men' | 'women'>('men');

  // Men measurements state
  const [menForm, setMenForm] = useState<MenMeasurements>({
    height: "5'11\"",
    weight: '75 kg',
    chest: 42,
    waist: 36,
    shoulder: 18.5,
    sleeveLength: 25.5,
    neck: 16.5,
    kurtaLength: 42,
    sherwaniLength: 44,
    pantLength: 41,
    thigh: 24,
    bottomOpening: 15,
    shoeSize: '9 UK',
    fittingPreference: 'comfort',
    notes: 'Broad shoulders, slight tapering needed around waist.',
  });

  // Women measurements state
  const [womenForm, setWomenForm] = useState<WomenMeasurements>({
    height: "5'6\"",
    bust: 36,
    waist: 29,
    hip: 39,
    shoulder: 14.5,
    sleeveLength: 12,
    armhole: 16,
    blouseLength: 14.5,
    frontNeckDepth: 7,
    backNeckDepth: 9,
    lehengaWaist: 30,
    lehengaLength: 42,
    dupattaLength: '2.5 Meters',
    fittingPreference: 'regular',
    notes: 'Padded blouse with sweetheart neckline.',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getCustomers().then((custs) => {
      setCustomers(custs);
      if (custs.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(custs[0].id);
      }
    });
  }, [refreshTrigger]);

  useEffect(() => {
    if (!selectedCustomerId) return;
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (cust) {
      if (cust.menMeasurements) setMenForm({ ...menForm, ...cust.menMeasurements });
      if (cust.womenMeasurements) setWomenForm({ ...womenForm, ...cust.womenMeasurements });
    }
  }, [selectedCustomerId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      showToast('Please select a patron first', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.saveMeasurements(
        selectedCustomerId,
        genderMode === 'men' ? menForm : undefined,
        genderMode === 'women' ? womenForm : undefined
      );
      showToast('Measurements saved successfully to patron profile!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save measurements', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Custom Tailoring & Measurements Ledger
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Standard Indian sizing, bespoke fittings & alteration snapshots for grooms & brides
          </p>
        </div>

        {/* Gender Mode Tabs */}
        <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-stone-200 text-xs">
          <button
            type="button"
            onClick={() => setGenderMode('men')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
              genderMode === 'men' ? 'bg-[#1F2421] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Men's Groom & Sherwani
          </button>
          <button
            type="button"
            onClick={() => setGenderMode('women')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
              genderMode === 'women' ? 'bg-[#1F2421] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Women's Bridal & Lehenga
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-7 rounded-2xl border border-[#EBE4D5] shadow-xs space-y-6">
        {/* Patron Selector */}
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE3D2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#C5A059]" />
            <span className="text-xs font-bold text-stone-800">Select Patron for Measurements:</span>
          </div>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none font-semibold text-stone-800 min-w-[260px]"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        {/* Men's Form */}
        {genderMode === 'men' && (
          <div className="space-y-4 text-xs">
            <div className="text-xs font-bold text-[#9E7B3B] uppercase tracking-wider">
              Sherwani, Indo-Western & Kurta Measurements (Inches)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Chest (Inch) *</label>
                <input
                  type="number"
                  step="0.5"
                  value={menForm.chest || ''}
                  onChange={(e) => setMenForm({ ...menForm, chest: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Waist (Inch) *</label>
                <input
                  type="number"
                  step="0.5"
                  value={menForm.waist || ''}
                  onChange={(e) => setMenForm({ ...menForm, waist: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Shoulder (Across)</label>
                <input
                  type="number"
                  step="0.5"
                  value={menForm.shoulder || ''}
                  onChange={(e) => setMenForm({ ...menForm, shoulder: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Sleeve Length</label>
                <input
                  type="number"
                  step="0.5"
                  value={menForm.sleeveLength || ''}
                  onChange={(e) => setMenForm({ ...menForm, sleeveLength: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Sherwani Length</label>
                <input
                  type="number"
                  step="0.5"
                  value={menForm.sherwaniLength || ''}
                  onChange={(e) => setMenForm({ ...menForm, sherwaniLength: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Kurta Length</label>
                <input
                  type="number"
                  step="0.5"
                  value={menForm.kurtaLength || ''}
                  onChange={(e) => setMenForm({ ...menForm, kurtaLength: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Pant / Churidar Length</label>
                <input
                  type="number"
                  step="0.5"
                  value={menForm.pantLength || ''}
                  onChange={(e) => setMenForm({ ...menForm, pantLength: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Neck Collar</label>
                <input
                  type="number"
                  step="0.5"
                  value={menForm.neck || ''}
                  onChange={(e) => setMenForm({ ...menForm, neck: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Thigh / Mori</label>
                <input
                  type="number"
                  step="0.5"
                  value={menForm.thigh || ''}
                  onChange={(e) => setMenForm({ ...menForm, thigh: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Fitting Preference</label>
                <select
                  value={menForm.fittingPreference}
                  onChange={(e) => setMenForm({ ...menForm, fittingPreference: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none"
                >
                  <option value="slim">Slim / Royal Fit</option>
                  <option value="regular">Regular Fit</option>
                  <option value="comfort">Comfort / Loose Fit</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Jutti / Shoe Size</label>
                <input
                  type="text"
                  value={menForm.shoeSize || ''}
                  onChange={(e) => setMenForm({ ...menForm, shoeSize: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Height & Weight</label>
                <input
                  type="text"
                  placeholder="e.g. 5'10, 75kg"
                  value={menForm.height || ''}
                  onChange={(e) => setMenForm({ ...menForm, height: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Tailor Alteration Instructions</label>
              <textarea
                rows={2}
                value={menForm.notes || ''}
                onChange={(e) => setMenForm({ ...menForm, notes: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
        )}

        {/* Women's Form */}
        {genderMode === 'women' && (
          <div className="space-y-4 text-xs">
            <div className="text-xs font-bold text-[#9E7B3B] uppercase tracking-wider">
              Bridal Lehenga & Blouse Tailoring Specs (Inches)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Bust (Inch) *</label>
                <input
                  type="number"
                  step="0.5"
                  value={womenForm.bust || ''}
                  onChange={(e) => setWomenForm({ ...womenForm, bust: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Waist (Underbust) *</label>
                <input
                  type="number"
                  step="0.5"
                  value={womenForm.waist || ''}
                  onChange={(e) => setWomenForm({ ...womenForm, waist: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Hip Measurement</label>
                <input
                  type="number"
                  step="0.5"
                  value={womenForm.hip || ''}
                  onChange={(e) => setWomenForm({ ...womenForm, hip: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Blouse Length</label>
                <input
                  type="number"
                  step="0.5"
                  value={womenForm.blouseLength || ''}
                  onChange={(e) => setWomenForm({ ...womenForm, blouseLength: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Lehenga Waist</label>
                <input
                  type="number"
                  step="0.5"
                  value={womenForm.lehengaWaist || ''}
                  onChange={(e) => setWomenForm({ ...womenForm, lehengaWaist: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Lehenga Length (With Heels)</label>
                <input
                  type="number"
                  step="0.5"
                  value={womenForm.lehengaLength || ''}
                  onChange={(e) => setWomenForm({ ...womenForm, lehengaLength: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Front Neck Depth</label>
                <input
                  type="number"
                  step="0.5"
                  value={womenForm.frontNeckDepth || ''}
                  onChange={(e) => setWomenForm({ ...womenForm, frontNeckDepth: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Back Neck Depth</label>
                <input
                  type="number"
                  step="0.5"
                  value={womenForm.backNeckDepth || ''}
                  onChange={(e) => setWomenForm({ ...womenForm, backNeckDepth: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Blouse Padding & Drape Notes</label>
              <textarea
                rows={2}
                value={womenForm.notes || ''}
                onChange={(e) => setWomenForm({ ...womenForm, notes: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#1F2421] text-white hover:bg-black text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#C5A059]" />
            <span>{saving ? 'Saving...' : 'Save & Attach to Patron Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
