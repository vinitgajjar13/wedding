import React, { useState } from 'react';
import { X, Shirt, Plus, Trash2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/api.js';

export const ProductFormModal: React.FC = () => {
  const { isNewProductOpen, setIsNewProductOpen, showToast, triggerRefresh } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Sherwani',
    gender: 'Men',
    description: '',
    fabric: 'Raw Silk',
    color: 'Cream Gold',
    designer: 'VastraVeda Atelier',
    purchasePrice: 15000,
    rentalPrice: 4500,
    salePrice: 28000,
    securityDeposit: 5000,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'],
    includedItems: 'Sherwani, Churidar, Stole/Dupatta, Safa',
  });

  const [physicalPieces, setPhysicalPieces] = useState<Array<{ size: string; location: string }>>([
    { size: '40', location: 'Rack A-1 (Main Store)' },
    { size: '42', location: 'Rack A-2 (Main Store)' },
  ]);

  const [submitting, setSubmitting] = useState(false);

  if (!isNewProductOpen) return null;

  const handleAddPiece = () => {
    setPhysicalPieces([...physicalPieces, { size: '38', location: 'Rack A-1 (Main Store)' }]);
  };

  const handleRemovePiece = (index: number) => {
    setPhysicalPieces(physicalPieces.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      showToast('Please enter garment name and SKU', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createProduct({
        ...formData,
        sizes: physicalPieces.map((p) => p.size),
        initialPieces: physicalPieces,
        includedItems: formData.includedItems.split(',').map((s) => s.trim()),
      });
      showToast('Garment & physical pieces added successfully!', 'success');
      triggerRefresh();
      setIsNewProductOpen(false);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to add garment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#EBE5DA] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Shirt className="w-4 h-4 text-[#C5A059]" />
            <h3 className="font-luxury font-bold text-[#1F2421] text-base">Add New Garment to Collection</h3>
          </div>
          <button
            onClick={() => setIsNewProductOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Garment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Garment Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Emerald Velvet Sherwani"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Product SKU *</label>
              <input
                type="text"
                required
                placeholder="e.g. SH-EMERALD-01"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              >
                <option value="Sherwani">Sherwani</option>
                <option value="Bridal & Designer Lehenga">Bridal Lehenga</option>
                <option value="Indo-Western">Indo-Western</option>
                <option value="Bandhgala & Jodhpuri">Bandhgala</option>
                <option value="Kurta Jacket & Haldi Set">Haldi Set</option>
                <option value="Accessories & Safa">Accessories & Safa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              >
                <option value="Men">Men's Wear</option>
                <option value="Women">Women's Bridal</option>
                <option value="Unisex">Unisex / Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Fabric</label>
              <input
                type="text"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Color / Tone</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EFE8DC] space-y-3">
            <div className="text-xs font-bold text-[#9E7B3B] uppercase tracking-wider">
              Financials & Deposit Escrow
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Rental (3 Days)</label>
                <input
                  type="number"
                  value={formData.rentalPrice}
                  onChange={(e) => setFormData({ ...formData, rentalPrice: Number(e.target.value) })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-md outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Security Deposit</label>
                <input
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) => setFormData({ ...formData, securityDeposit: Number(e.target.value) })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-md outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Purchase Cost</label>
                <input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-md outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Sale Price</label>
                <input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-md outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </div>

          {/* Physical Pieces Generation */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800">
                Initial Physical Pieces & Sizes
              </label>
              <button
                type="button"
                onClick={handleAddPiece}
                className="text-xs font-semibold text-[#9E7B3B] hover:text-[#7D612A] inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Size Piece
              </button>
            </div>

            <div className="space-y-2">
              {physicalPieces.map((piece, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-xs font-mono font-bold text-stone-500">Piece #{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="Size (e.g. 40, 42, M)"
                    value={piece.size}
                    onChange={(e) => {
                      const updated = [...physicalPieces];
                      updated[idx].size = e.target.value;
                      setPhysicalPieces(updated);
                    }}
                    className="w-24 text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g. Rack A-1)"
                    value={piece.location}
                    onChange={(e) => {
                      const updated = [...physicalPieces];
                      updated[idx].location = e.target.value;
                      setPhysicalPieces(updated);
                    }}
                    className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded outline-none"
                  />
                  {physicalPieces.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePiece(idx)}
                      className="p-1 text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Description & Craftsmanship</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Handcrafted zardozi embroidery with gold dabka and resham work..."
              className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Included Items */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Included Accessories (Comma separated)</label>
            <input
              type="text"
              value={formData.includedItems}
              onChange={(e) => setFormData({ ...formData, includedItems: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewProductOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1F2421] hover:bg-[#323A35] rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving Garment...' : 'Save Garment & Generate Pieces'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
