import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Download, Sparkles, Tag, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { CurrencyDisplay } from './CurrencyDisplay.js';
import { StatusBadge } from './StatusBadge.js';

export const QrModal: React.FC = () => {
  const { activeQrItem, setActiveQrItem, showToast } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!activeQrItem) return;

    // Generate real QR code containing item identity payload
    const payload = JSON.stringify({
      vastraItem: activeQrItem.id,
      sku: activeQrItem.sku,
      barcode: activeQrItem.barcode,
      size: activeQrItem.size,
      status: activeQrItem.status,
    });

    QRCode.toDataURL(payload, {
      width: 260,
      margin: 2,
      color: {
        dark: '#1F2421',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR Gen error', err));
  }, [activeQrItem]);

  if (!activeQrItem) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTag = () => {
    navigator.clipboard.writeText(`${activeQrItem.id} | ${activeQrItem.sku} | Size ${activeQrItem.size}`);
    setCopied(true);
    showToast('Garment tag copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#EBE5DA] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#C5A059]" />
            <h3 className="font-luxury font-bold text-[#1F2421] text-base">Garment Physical QR Tag</h3>
          </div>
          <button
            onClick={() => setActiveQrItem(null)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Printable Garment Tag Frame */}
          <div className="p-5 border-2 border-dashed border-[#D6CBB8] rounded-xl bg-[#FCFAF7] inline-block w-full max-w-[320px] mx-auto shadow-xs">
            <div className="text-[11px] uppercase tracking-widest text-[#9E7B3B] font-semibold mb-1">
              VastraVeda Bridal & Groom Atelier
            </div>
            <div className="font-luxury text-lg font-extrabold text-[#1F2421] tracking-wider mb-2">
              ITEM: {activeQrItem.id}
            </div>

            {/* QR Image */}
            <div className="p-2 bg-white rounded-lg border border-stone-200 shadow-xs inline-block my-2">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR Code for ${activeQrItem.id}`} className="w-44 h-44 mx-auto" />
              ) : (
                <div className="w-44 h-44 bg-stone-100 animate-pulse flex items-center justify-center text-xs text-stone-400">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Item Meta info */}
            <div className="mt-3 space-y-1.5 text-xs text-left bg-white p-3 rounded-lg border border-stone-200/70">
              <div className="flex justify-between">
                <span className="text-stone-500">SKU:</span>
                <span className="font-semibold text-stone-900">{activeQrItem.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Size:</span>
                <span className="font-bold text-stone-900 px-2 py-0.5 bg-[#FAF4E6] text-[#9E7B3B] rounded text-[11px]">
                  {activeQrItem.size}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Location:</span>
                <span className="text-stone-700 font-medium">{activeQrItem.currentLocation}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Condition:</span>
                <StatusBadge status={activeQrItem.condition} size="sm" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Total Rentals:</span>
                <span className="font-semibold text-stone-800">{activeQrItem.rentalCount} times</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-500 mt-4 leading-relaxed">
            Attach this durable tag onto garment wooden hanger / velvet suit cover. Scanning with boutique mobile device immediately reveals trial and return history.
          </p>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#F0ECE1] flex items-center justify-between gap-3">
          <button
            onClick={handleCopyTag}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Tag className="w-3.5 h-3.5 text-stone-500" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`VastraTag-${activeQrItem.id}.png`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              Download PNG
            </a>
          )}
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1F2421] hover:bg-[#2F3532] rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Tag
          </button>
        </div>
      </div>
    </div>
  );
};
