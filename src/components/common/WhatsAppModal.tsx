import React, { useState, useEffect } from 'react';
import { X, Send, MessageCircle, Copy, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/api.js';

export const WhatsAppModal: React.FC = () => {
  const { activeWhatsAppBooking, setActiveWhatsAppBooking, showToast } = useApp();
  const [templateType, setTemplateType] = useState<string>('confirmation');
  const [generatedText, setGeneratedText] = useState<string>('');
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const booking = activeWhatsAppBooking?.booking;

  useEffect(() => {
    if (activeWhatsAppBooking?.defaultType) {
      setTemplateType(activeWhatsAppBooking.defaultType);
    }
  }, [activeWhatsAppBooking]);

  useEffect(() => {
    if (!booking) return;

    setLoading(true);
    api
      .generateWhatsAppLink(booking.id, templateType as any)
      .then((res) => {
        setGeneratedText(res.text);
        setWhatsappUrl(res.whatsappUrl);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [booking, templateType]);

  if (!booking) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    showToast('WhatsApp message text copied', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
      showToast('Opening WhatsApp Web / App...', 'success');
      setActiveWhatsAppBooking(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#EBE5DA] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-luxury font-bold text-[#1F2421] text-base">WhatsApp Concierge Intimation</h3>
              <p className="text-[11px] text-stone-500">
                To: {booking.customerName} ({booking.customerWhatsapp || booking.customerPhone})
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveWhatsAppBooking(null)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector Tabs */}
        <div className="p-4 border-b border-stone-100 bg-[#FCFAF7] flex gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setTemplateType('confirmation')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              templateType === 'confirmation'
                ? 'bg-[#1F2421] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Booking Confirmed
          </button>
          <button
            onClick={() => setTemplateType('pickup')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              templateType === 'pickup'
                ? 'bg-[#1F2421] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Ready for Pickup
          </button>
          <button
            onClick={() => setTemplateType('return_reminder')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              templateType === 'return_reminder'
                ? 'bg-[#1F2421] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Return Reminder
          </button>
          <button
            onClick={() => setTemplateType('late')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              templateType === 'late'
                ? 'bg-[#1F2421] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Late Return Alert
          </button>
          <button
            onClick={() => setTemplateType('deposit_refund')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              templateType === 'deposit_refund'
                ? 'bg-[#1F2421] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Deposit Refunded
          </button>
        </div>

        {/* Message Preview */}
        <div className="p-6">
          <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
            Message Preview (Indian WhatsApp Format)
          </label>
          <div className="p-4 bg-[#EFEAE2] rounded-xl border border-[#D5CCBC] relative shadow-inner">
            <div className="bg-white p-3.5 rounded-lg shadow-xs text-xs text-stone-800 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {loading ? (
                <div className="text-stone-400 py-6 text-center animate-pulse">Formatting customized luxury template...</div>
              ) : (
                generatedText
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[11px] text-stone-500">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Pre-formatted with Indian etiquette, wedding titles, venue dates, and escrow refund reminders.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#F0ECE1] flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
          <button
            onClick={handleSendWhatsApp}
            disabled={!whatsappUrl}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Send via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
