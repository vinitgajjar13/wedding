import React, { useState, useEffect } from 'react';
import {
  Shirt,
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  QrCode,
  Tag,
  Grid,
  List,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { Product } from '../types/index.js';
import { CurrencyDisplay } from '../components/common/CurrencyDisplay.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { ProductDetailModal } from '../components/products/ProductDetailModal.js';
import { ProductFormModal } from '../components/products/ProductFormModal.js';

export const ProductsView: React.FC = () => {
  const {
    t,
    setActiveProductDetail,
    setIsNewProductOpen,
    openBookingWizardWithOutfit,
    refreshTrigger,
    showToast,
  } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({
        gender: genderFilter !== 'all' ? genderFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchTerm || undefined,
      })
      .then(setProducts)
      .catch((err) => {
        console.error(err);
        showToast('Failed to load products', 'error');
      })
      .finally(() => setLoading(false));
  }, [genderFilter, categoryFilter, searchTerm, refreshTrigger]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE4D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-luxury text-xl sm:text-2xl font-bold text-[#1F2421]">
              Wedding Wear Collection & Catalog
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Bridal Lehengas, Groom Sherwanis, Indo-Westerns & Accessories with physical piece management
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewProductOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F2421] text-white hover:bg-[#323A35] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>+ Add New Garment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EBE4D5] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, SKU, fabric, designer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
          />
        </div>

        {/* Gender Tabs */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-stone-200 text-xs">
          <button
            onClick={() => setGenderFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              genderFilter === 'all' ? 'bg-[#1F2421] text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Outfits
          </button>
          <button
            onClick={() => setGenderFilter('Men')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              genderFilter === 'Men' ? 'bg-[#1F2421] text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Men's Groom
          </button>
          <button
            onClick={() => setGenderFilter('Women')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              genderFilter === 'Women' ? 'bg-[#1F2421] text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Bridal / Women
          </button>
          <button
            onClick={() => setGenderFilter('Unisex')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              genderFilter === 'Unisex' ? 'bg-[#1F2421] text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Safas & Accessories
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 border-l border-stone-200 pl-3">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-stone-200 text-stone-900' : 'text-stone-400 hover:bg-stone-100'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-stone-200 text-stone-900' : 'text-stone-400 hover:bg-stone-100'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid or Table Mode */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-stone-200 animate-pulse space-y-3">
              <div className="h-48 bg-stone-100 rounded-xl" />
              <div className="h-4 bg-stone-100 rounded w-2/3" />
              <div className="h-3 bg-stone-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-stone-300 text-center space-y-3">
          <Shirt className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-luxury font-bold text-stone-800 text-base">No garments matching criteria</h3>
          <p className="text-xs text-stone-500">Try adjusting your search terms or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p: any) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-all group"
            >
              {/* Image */}
              <div
                onClick={() => setActiveProductDetail(p)}
                className="relative h-56 bg-stone-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-stone-800 text-[10px] font-bold uppercase rounded-full shadow-xs">
                    {p.gender} • {p.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-0.5 rounded text-[11px] font-mono">
                  {p.sku}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3
                    onClick={() => setActiveProductDetail(p)}
                    className="font-luxury font-bold text-stone-900 text-base leading-snug hover:text-[#9E7B3B] cursor-pointer"
                  >
                    {p.name}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{p.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.sizes?.map((s: string) => (
                      <span key={s} className="px-1.5 py-0.5 bg-[#FAF4E6] text-[#9E7B3B] font-bold rounded text-[10px]">
                        Sz {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stock Stats */}
                <div className="flex items-center justify-between text-xs py-2 px-3 bg-[#FAF8F5] rounded-xl border border-[#F0ECE1]">
                  <span className="text-stone-500">Available Pieces:</span>
                  <span
                    className={`font-bold ${
                      p.availableCount === 0 ? 'text-rose-600' : p.availableCount <= 1 ? 'text-amber-600' : 'text-emerald-700'
                    }`}
                  >
                    {p.availableCount || 0} / {p.totalPieces || p.physicalItems?.length || 2} Available
                  </span>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-stone-400">3-Day Rental</div>
                    <CurrencyDisplay amount={p.rentalPrice} className="text-base font-extrabold text-[#1F2421]" />
                    <div className="text-[10px] text-stone-400">+ ₹{p.securityDeposit?.toLocaleString('en-IN')} Dep</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveProductDetail(p)}
                      className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      title="View Details & Physical Pieces"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openBookingWizardWithOutfit(p)}
                      className="px-3 py-2 bg-[#1F2421] hover:bg-[#323A35] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white rounded-2xl border border-[#EBE4D5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Garment</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Fabric</th>
                  <th className="py-3 px-4">Sizes</th>
                  <th className="py-3 px-4 text-right">Rental Price</th>
                  <th className="py-3 px-4 text-right">Deposit</th>
                  <th className="py-3 px-4 text-center">Available Pieces</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-stone-50/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                        />
                        <div className="font-bold text-stone-900">{p.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600">{p.sku}</td>
                    <td className="py-3 px-4 text-stone-700">{p.category}</td>
                    <td className="py-3 px-4 text-stone-600">{p.fabric}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {p.sizes?.map((s: string) => (
                          <span key={s} className="px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-stone-900">
                      <CurrencyDisplay amount={p.rentalPrice} />
                    </td>
                    <td className="py-3 px-4 text-right text-stone-600">
                      <CurrencyDisplay amount={p.securityDeposit} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-emerald-700">{p.availableCount || 0}</span>
                      <span className="text-stone-400"> / {p.totalPieces || 2}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActiveProductDetail(p)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openBookingWizardWithOutfit(p)}
                          className="px-2 py-1 bg-[#1F2421] text-white text-[11px] font-bold rounded-md"
                        >
                          Book
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
