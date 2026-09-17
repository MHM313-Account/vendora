import React, { useState, useEffect } from 'react';
import { 
  X, 
  Receipt, 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  ShieldCheck, 
  AlertTriangle, 
  CreditCard, 
  Calendar, 
  User, 
  Package, 
  Eye, 
  EyeOff, 
  Sparkles,
  DollarSign
} from 'lucide-react';

export default function DigitalReceiptModal({ saleId, isOpen, onClose }) {
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showCreds, setShowCreds] = useState(true);

  useEffect(() => {
    if (!saleId || !isOpen) return;
    setLoading(true);
    fetch(`/api/customer-sales/${saleId}/receipt`)
      .then(res => res.json())
      .then(data => setReceiptData(data))
      .catch(err => console.error('Error fetching receipt:', err))
      .finally(() => setLoading(false));
  }, [saleId, isOpen]);

  if (!isOpen || !saleId) return null;

  const handleCopyText = () => {
    if (!receiptData?.formattedWhatsAppText) return;
    navigator.clipboard.writeText(receiptData.formattedWhatsAppText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!receiptData?.formattedWhatsAppText) return;
    const phone = receiptData.sale?.customer_contact?.replace(/\D/g, '');
    const text = encodeURIComponent(receiptData.formattedWhatsAppText);
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const sale = receiptData?.sale;
  const isPending = sale?.pending_amount > 0 || sale?.payment_status === 'Pending / Udhaar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none print:bg-white print:text-black">
        
        {/* Header - Hidden in Print */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white shadow-md">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                ڈیجیٹل رسید و وارنٹی کارڈ (Digital Receipt & Warranty)
              </h2>
              <p className="text-[11px] text-slate-400">
                گاہک کو بھیجنے کے لیے آفیشل برانڈڈ رسید اور احتیاطی اصول
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Card */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-950/40 print:bg-white print:text-black print:p-8">
          
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">رسید تیار ہو رہی ہے...</div>
          ) : (
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden print:border print:border-gray-300 print:bg-white print:shadow-none">
              
              {/* Watermark/Stamp */}
              <div className="absolute top-4 right-4 text-right">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${
                  isPending 
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}>
                  {isPending ? '⚠️ ادھار / بقایا واجب' : '✓ ادا شدہ (PAID)'}
                </span>
              </div>

              {/* Brand Banner */}
              <div className="border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center font-black text-white text-xs">
                    V
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight">Vendora Digital Store</h3>
                </div>
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                  <span>رسید نمبر: <strong className="text-slate-200 font-mono">{receiptData?.invoiceNo}</strong></span>
                  <span>تاریخ: <strong className="text-slate-200 font-mono">{sale?.sale_date}</strong></span>
                </div>
              </div>

              {/* Customer & Product Section */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-gray-50 print:border-gray-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">خریدار / گاہک:</span>
                  <div className="font-bold text-white text-sm mt-0.5">{sale?.customer_name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{sale?.customer_contact || 'No Contact'}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">پراڈکٹ و پیکیج:</span>
                  <div className="font-bold text-indigo-400 text-sm mt-0.5">{sale?.product_name}</div>
                  <div className="text-[11px] text-slate-400">مدت: {sale?.duration || '1 Month'} • وارنٹی: {sale?.warranty_days} دن</div>
                </div>
              </div>

              {/* Warranty Expiry Highlight */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    فل ریپلیسمنٹ وارنٹی تا: {sale?.warranty_expiry ? sale.warranty_expiry.slice(0, 10) : `${sale?.warranty_days} دن`}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded">
                  100% گارنٹی
                </span>
              </div>

              {/* Credentials Box */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span>اکاؤنٹ لاگ ان اسناد (Credentials):</span>
                  <button
                    type="button"
                    onClick={() => setShowCreds(!showCreds)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {showCreds ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showCreds ? 'چھپائیں' : 'دیکھیں'}</span>
                  </button>
                </div>
                <code className="block w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs select-all">
                  {showCreds ? (sale?.credentials || 'اسناد فراہم کر دی گئیں') : '••••••••••••••••••••••••'}
                </code>
              </div>

              {/* Payment Breakdown */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 mb-4 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>کل رقم (Total Amount):</span>
                  <span className="font-mono text-white font-bold">${Number(sale?.sale_price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>ادا شدہ (Paid via {sale?.payment_method || 'JazzCash'}):</span>
                  <span className="font-mono font-bold">${Number(sale?.amount_paid || sale?.sale_price).toFixed(2)}</span>
                </div>
                {isPending && (
                  <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-slate-800">
                    <span>بقایا رقم (Pending Balance / Udhaar):</span>
                    <span className="font-mono">${Number(sale?.pending_amount).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Product Safety Rules */}
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>اکاؤنٹ کے احتیاطی اصول (Usage Guidelines):</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pl-5">
                  {receiptData?.safetyGuidelines}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Action Buttons - Hidden in Print */}
        <div className="p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>پرنٹ رسید (Print)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-bold transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp پر بھیجیں</span>
            </button>

            <button
              onClick={handleCopyText}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'رسید کاپی ہو گئی!' : 'میسج کاپی کریں'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
