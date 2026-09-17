import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  MessageCircle, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  BellRing,
  Send,
  Copy,
  Check,
  DollarSign
} from 'lucide-react';

export default function RenewalAlertsModal({ isOpen, onClose, onDataUpdated }) {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [renewingId, setRenewingId] = useState(null);
  const [daysFilter, setDaysFilter] = useState(5);
  const [renewInputs, setRenewInputs] = useState({});

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customer-sales/renewals?days=${daysFilter}`);
      const data = await res.json();
      setRenewals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading renewals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRenewals();
    }
  }, [isOpen, daysFilter]);

  if (!isOpen) return null;

  const handleCopyWhatsApp = (sale) => {
    if (!sale?.whatsappReminderMessage) return;
    navigator.clipboard.writeText(sale.whatsappReminderMessage);
    setCopiedId(sale.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenWhatsApp = (sale) => {
    if (!sale?.whatsappReminderMessage) return;
    const phone = (sale.customer_contact || '').replace(/\D/g, '');
    const text = encodeURIComponent(sale.whatsappReminderMessage);
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const handleRenew = async (sale) => {
    const customDays = renewInputs[sale.id]?.days || sale.warranty_days || 30;
    const customPrice = renewInputs[sale.id]?.price || sale.sale_price;

    setRenewingId(sale.id);
    try {
      const res = await fetch(`/api/customer-sales/${sale.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additional_days: Number(customDays),
          sale_price: Number(customPrice)
        })
      });
      if (res.ok) {
        await fetchRenewals();
        if (onDataUpdated) onDataUpdated();
      }
    } catch (err) {
      console.error('Error renewing sale:', err);
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  رینیوول الرٹ انجن (Renewal & Expiry Alert)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {renewals.length} اکاؤنٹس ختم ہو رہے ہیں
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                اگلے {daysFilter} دنوں میں ایکسپائر ہونے والے اکاؤنٹس کو 1-کلک پر واٹس ایپ ریمائنڈر بھیجیں اور سبسکرپشن بڑھائیں
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value={2}>اگلے 2 دن</option>
              <option value={5}>اگلے 5 دن</option>
              <option value={7}>اگلے 7 دن</option>
              <option value={15}>اگلے 15 دن</option>
            </select>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
              <span>ایکسپائری ڈیٹا لوڈ ہو رہا ہے...</span>
            </div>
          ) : renewals.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800/80">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">کوئی اکاؤنٹ ایکسپائر نہیں ہو رہا</h3>
              <p className="text-xs text-slate-500">
                اگلے {daysFilter} دنوں میں کوئی سبسکرپشن ختم نہیں ہونے والی۔ تمام اکاؤنٹس محفوظ ہیں۔
              </p>
            </div>
          ) : (
            renewals.map((sale) => {
              const isCopied = copiedId === sale.id;
              const isRenewing = renewingId === sale.id;
              const isUrgent = sale.days_remaining <= 1;

              return (
                <div 
                  key={sale.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUrgent 
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-rose-950/20 shadow-md' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl mt-0.5 ${
                        isUrgent 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{sale.customer_name}</h4>
                          <span className="text-xs text-slate-400 font-mono">({sale.customer_contact || 'No contact'})</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sale.days_remaining <= 0 
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                              : sale.days_remaining === 1 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}>
                            {sale.days_remaining <= 0 
                              ? 'آج آخری دن ہے!' 
                              : `${sale.days_remaining} دن باقی`}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                          <span className="font-semibold text-indigo-300">{sale.product_name}</span>
                          <span className="text-slate-500">•</span>
                          <span>شروع: <span className="font-mono text-slate-400">{sale.sale_date?.slice(0, 10)}</span></span>
                          <span className="text-slate-500">•</span>
                          <span>ایکسپائری: <span className="font-mono text-rose-300 font-bold">{sale.calculated_expiry?.slice(0, 10)}</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">موجودہ ریٹ</div>
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        ${Number(sale.sale_price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Reminder Text Preview Box */}
                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-300 font-sans mb-3 whitespace-pre-wrap leading-relaxed select-all">
                    {sale.whatsappReminderMessage}
                  </div>

                  {/* Actions row: WhatsApp Send, Copy, and 1-Click Renew */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenWhatsApp(sale)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>واٹس ایپ بھیجیں</span>
                      </button>
                      
                      <button
                        onClick={() => handleCopyWhatsApp(sale)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'کاپی ہوگیا!' : 'میسج کاپی کریں'}</span>
                      </button>
                    </div>

                    {/* 1-Click Renew Control */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1">
                        <span className="text-[10px] text-slate-400">دن:</span>
                        <input
                          type="number"
                          min="1"
                          defaultValue={sale.warranty_days || 30}
                          onChange={(e) => setRenewInputs(prev => ({
                            ...prev,
                            [sale.id]: { ...(prev[sale.id] || {}), days: e.target.value }
                          }))}
                          className="w-12 bg-transparent text-white text-xs font-mono focus:outline-none text-center"
                        />
                      </div>

                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1">
                        <span className="text-[10px] text-slate-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={sale.sale_price}
                          onChange={(e) => setRenewInputs(prev => ({
                            ...prev,
                            [sale.id]: { ...(prev[sale.id] || {}), price: e.target.value }
                          }))}
                          className="w-14 bg-transparent text-white text-xs font-mono focus:outline-none text-center"
                        />
                      </div>

                      <button
                        onClick={() => handleRenew(sale)}
                        disabled={isRenewing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRenewing ? 'animate-spin' : ''}`} />
                        <span>{isRenewing ? 'رینیو ہو رہا ہے...' : '1-کلک رینیو'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 text-xs text-slate-400">
          <span>سبسکرپشن بڑھانے پر ایکسپائری کی نئی تاریخ خودکار طور پر کیلکولیٹ ہو جائے گی۔</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
          >
            بند کریں
          </button>
        </div>

      </div>
    </div>
  );
}
