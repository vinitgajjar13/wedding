import React, { useEffect, useState } from 'react';
import { X, Sparkles, Tag, ShieldCheck, QrCode, ArrowRight, Layers, Clock, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/api.js';
import { PhysicalInventoryItem, Product } from '../../types/index.js';
import { CurrencyDisplay } from '../common/CurrencyDisplay.js';
import { StatusBadge } from '../common/StatusBadge.js';

export const ProductDetailModal: React.FC = () => {
  const { activeProductDetail, setActiveProductDetail, openBookingWizardWithOutfit, setActiveQrItem } = useApp();
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeProductDetail) return;
    setLoading(true);
    api
      .getProduct(activeProductDetail.id)
      .then(setProductData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeProductDetail]);

  if (!activeProductDetail) return null;

  const prod = productData || activeProductDetail;
  const physicalItems: PhysicalInventoryItem[] = prod.physicalItems || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#EBE5DA] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#C5A059]" />
            <h3 className="font-luxury font-bold text-[#1F2421] text-base">Couture Garment Specification</h3>
          </div>
          <button
            onClick={() => setActiveProductDetail(null)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top Hero: Images + Key Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-64 rounded-xl bg-stone-100 overflow-hidden border border-stone-200">
                <img
                  src={prod.images?.[0]}
                  alt={prod.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {prod.images?.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {prod.images.slice(1, 4).map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${prod.name}-${idx}`}
                      className="h-16 w-full object-cover rounded-lg border border-stone-200"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#9E7B3B] uppercase tracking-wider">
                  {prod.category} • {prod.gender}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 bg-stone-100 text-stone-700 rounded">
                  SKU: {prod.sku}
                </span>
              </div>

              <h2 className="font-luxury text-xl font-bold text-stone-900 leading-snug">
                {prod.name}
              </h2>

              <p className="text-xs text-stone-600 leading-relaxed">
                {prod.description}
              </p>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#FCFAF7] p-3 rounded-xl border border-[#EFE8DC]">
                <div>
                  <span className="text-stone-400 block text-[10px]">Fabric:</span>
                  <span className="font-medium text-stone-800">{prod.fabric}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Color:</span>
                  <span className="font-medium text-stone-800">{prod.color}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Designer:</span>
                  <span className="font-medium text-stone-800">{prod.designer}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Work Type:</span>
                  <span className="font-medium text-stone-800">{prod.embroideryType || 'Hand Zardozi'}</span>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-400 block font-semibold">3-Day Rental</span>
                  <CurrencyDisplay amount={prod.rentalPrice} className="text-base font-bold text-stone-900" />
                  <span className="text-[10px] text-stone-500 block">+ ₹{prod.securityDeposit?.toLocaleString('en-IN')} Deposit</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-400 block font-semibold">Purchase Price</span>
                  <CurrencyDisplay amount={prod.purchasePrice} className="text-base font-bold text-stone-700" />
                  <span className="text-[10px] text-stone-500 block">Retail Sale: ₹{prod.salePrice?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Inventory Items Table */}
          <div className="space-y-3 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C5A059]" />
                <h4 className="font-luxury font-bold text-sm text-stone-900">
                  Physical Inventory Pieces ({physicalItems.length})
                </h4>
              </div>
              <span className="text-xs text-stone-500">Each piece has a distinct QR identifier & lifecycle</span>
            </div>

            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Garment ID</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Condition</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3 text-center">Rental Count</th>
                    <th className="py-2.5 px-3 text-center">QR Tag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {physicalItems.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-stone-900">{item.id}</td>
                      <td className="py-2.5 px-3 font-bold text-stone-800">{item.size}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={item.condition} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">{item.currentLocation}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-stone-800">
                        {item.rentalCount} times
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setActiveQrItem(item)}
                          className="p-1 rounded bg-stone-100 hover:bg-[#FAF4E6] text-stone-700 hover:text-[#9E7B3B] transition-colors"
                          title="Generate QR code"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#F0ECE1] flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Total piece investments tracked: ₹{((prod.purchasePrice || 0) * physicalItems.length).toLocaleString('en-IN')}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveProductDetail(null);
                openBookingWizardWithOutfit(prod);
              }}
              className="px-4 py-2 bg-[#1F2421] text-white hover:bg-[#323A35] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Create Rental Booking</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
