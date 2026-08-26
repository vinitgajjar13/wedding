import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Tag,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { AvailabilitySearchResult, Category, PhysicalInventoryItem, Product } from '../types/index.js';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay.js';
import { StatusBadge } from '../components/common/StatusBadge.js';

export const SmartAvailabilityView: React.FC = () => {
  const { openBookingWizardWithOutfit, setActiveProductDetail, setActiveQrItem, showToast } = useApp();

  const today = new Date();
  const defaultStart = new Date(today.getTime() + 86400000 * 2).toISOString().split('T')[0];
  const defaultEnd = new Date(today.getTime() + 86400000 * 5).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);
  const [category, setCategory] = useState<string>('all');
  const [gender, setGender] = useState<string>('all');
  const [size, setSize] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number>(15000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<AvailabilitySearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
    performSearch();
  }, []);

  const setDurationPreset = (days: number) => {
    if (!startDate) return;
    const start = new Date(startDate);
    const end = new Date(start.getTime() + 86400000 * days);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const performSearch = async () => {
    if (!startDate || !endDate) {
      showToast('Please select both Event date and Return date', 'error');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      showToast('Return date must be on or after Event date', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.checkAvailability({
        startDate,
        endDate,
        category: category !== 'all' ? category : undefined,
        gender: gender !== 'all' ? gender : undefined,
        size: size !== 'all' ? size : undefined,
        maxBudget: Number(maxBudget) > 0 ? Number(maxBudget) : undefined,
        searchQuery: searchQuery || undefined,
      });
      setResults(res.data || []);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      showToast('Failed to check availability', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = onlyAvailable ? results.filter((r) => r.isAvailable) : results;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Search Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF4E6] text-[#9E7B3B] text-xs font-bold rounded-lg border border-[#EBDCB9] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Live Backend Date Overlap Engine
            </div>
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Smart Outfit Availability Finder
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Find guaranteed available designer Sherwanis, Bridal Lehengas & Indo-Westerns for specific wedding dates, sizes, and budgets. Automatically incorporates drycleaning & alteration buffers.
            </p>
          </div>

          {/* Quick Duration Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-stone-400 mr-1">Rental Presets:</span>
            <button
              type="button"
              onClick={() => setDurationPreset(1)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
            >
              1 Day
            </button>
            <button
              type="button"
              onClick={() => setDurationPreset(3)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FAF4E6] text-[#9E7B3B] border border-[#EBDCB9] hover:bg-[#F5EAD2] transition-colors"
            >
              3 Days (Standard)
            </button>
            <button
              type="button"
              onClick={() => setDurationPreset(4)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
            >
              4 Days (Destination)
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Event / Pickup Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Event or Pickup Date"
              className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-stone-300 rounded-xl outline-none focus:border-[#C5A059] font-medium"
            />
          </div>

          {/* Return Date */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Scheduled Return Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="Scheduled Return Date"
              className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-stone-300 rounded-xl outline-none focus:border-[#C5A059] font-medium"
            />
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Gender Category
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              aria-label="Gender Category"
              className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-stone-300 rounded-xl outline-none focus:border-[#C5A059] font-medium"
            >
              <option value="all">All Genders</option>
              <option value="men">Men's Wedding Wear</option>
              <option value="women">Women's Bridal Wear</option>
              <option value="accessories">Accessories & Safas</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Garment Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Garment Category"
              className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-stone-300 rounded-xl outline-none focus:border-[#C5A059] font-medium"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} ({cat.gender})
                </option>
              ))}
            </select>
          </div>

          {/* Size Filter */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Size Needed
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              aria-label="Garment Size Needed"
              className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-stone-300 rounded-xl outline-none focus:border-[#C5A059] font-medium"
            >
              <option value="all">Any Size</option>
              <optgroup label="Men's Chest Sizes">
                <option value="36">36 (S)</option>
                <option value="38">38 (M)</option>
                <option value="40">40 (L)</option>
                <option value="42">42 (XL)</option>
                <option value="44">44 (XXL)</option>
                <option value="46">46 (3XL)</option>
              </optgroup>
              <optgroup label="Women's Lehenga Sizes">
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="Custom">Custom</option>
              </optgroup>
            </select>
          </div>

          {/* Max Rental Budget Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
              <span>Max Rental Budget:</span>
              <span className="text-[#9E7B3B]">₹{maxBudget.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={2000}
              max={25000}
              step={500}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              aria-label="Max Rental Budget Slider"
              className="w-full accent-[#1F2421] cursor-pointer mt-1"
            />
          </div>

          {/* Keyword Search */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Style / Fabric / Keyword
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Zardozi, Velvet, Sabyasachi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                aria-label="Style, Fabric, or Keyword search"
                className="w-full text-xs pl-8 pr-3 py-2.5 bg-[#FAF8F5] border border-stone-300 rounded-xl outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Search Trigger Button */}
          <div className="flex items-end">
            <button
              onClick={performSearch}
              disabled={loading}
              className="w-full py-2.5 bg-[#1F2421] text-white hover:bg-[#303833] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              {loading ? 'Validating Overlaps...' : 'Check Live Availability'}
            </button>
          </div>
        </div>

        {/* Toggle only available */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-stone-700 font-medium">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded accent-[#1F2421] w-4 h-4"
            />
            <span>Show strictly available outfits only ({results.filter((r) => r.isAvailable).length} available)</span>
          </label>

          <span className="text-stone-400 text-[11px]">
            Dates queried: <span className="font-semibold text-stone-700">{startDate}</span> to <span className="font-semibold text-stone-700">{endDate}</span>
          </span>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-luxury font-bold text-base text-[#1F2421]">
            Available Outfits for Selection ({filteredResults.length})
          </h3>
          <span className="text-xs text-stone-500">
            Click "Book Now" to immediately pre-load garment & dates into booking workflow
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-5 rounded-2xl border border-stone-200 animate-pulse space-y-3">
                <div className="w-full h-48 bg-stone-100 rounded-xl" />
                <div className="h-4 bg-stone-100 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-[#E0D8C8] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF4E6] flex items-center justify-center text-[#9E7B3B] mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-luxury font-bold text-stone-800 text-base">No Outfits Available for These Exact Dates / Filters</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              All physical pieces matching these criteria are currently booked by other patrons or under scheduled maintenance. Try shifting the dates by 1–2 days or expanding the budget.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map(({ product, allPieces, availablePieces, isAvailable }) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-all group"
              >
                {/* Product Image & Badges */}
                <div className="relative h-56 bg-stone-100 overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-900/90 text-white backdrop-blur-xs shadow-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {availablePieces.length} Piece{availablePieces.length > 1 ? 's' : ''} Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-900/90 text-white backdrop-blur-xs shadow-xs">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        Booked for Dates
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-mono">
                    SKU: {product.sku}
                  </div>
                </div>

                {/* Product Meta */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#9E7B3B] font-semibold uppercase tracking-wider">
                      <span>{product.category}</span>
                      <span>{product.gender}</span>
                    </div>

                    <h4 className="font-luxury font-bold text-stone-900 text-base leading-snug line-clamp-1">
                      {product.name}
                    </h4>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
                        Fabric: {product.fabric}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
                        Designer: {product.designer}
                      </span>
                    </div>
                  </div>

                  {/* Physical Pieces Availability Pill Bar */}
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EFE8DC] space-y-1.5">
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      Physical Inventory Breakdown:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allPieces.map((piece: any) => (
                        <div
                          key={piece.id}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border font-mono ${
                            piece.isDateAvailable
                              ? 'bg-white text-emerald-800 border-emerald-300 font-semibold shadow-2xs'
                              : 'bg-rose-50/70 text-rose-700 border-rose-200 line-through opacity-75'
                          }`}
                          title={piece.isDateAvailable ? `Piece ${piece.id} Available` : piece.conflictReason}
                        >
                          <span>{piece.id}</span>
                          <span className="text-[10px] px-1 bg-stone-100 rounded not-line-through">
                            Sz {piece.size}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-stone-400">3-Day Rental</div>
                      <CurrencyDisplay
                        amount={product.rentalPrice}
                        className="text-lg font-extrabold text-[#1F2421]"
                      />
                      <div className="text-[10px] text-stone-500">
                        + ₹{product.securityDeposit.toLocaleString('en-IN')} Deposit
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAvailable && (
                        <button
                          onClick={() =>
                            openBookingWizardWithOutfit(
                              product,
                              availablePieces[0],
                              startDate,
                              endDate
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F2421] hover:bg-[#323A35] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Book Outfit</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
