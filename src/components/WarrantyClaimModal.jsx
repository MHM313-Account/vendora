import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Copy, Check, ExternalLink, RefreshCw, Send, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function WarrantyClaimModal({ saleId, onClose, onStatusUpdated }) {
  const [claimData, setClaimData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState('');

  useEffect(() => {
    if (!saleId) return;
    const fetchClaim = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customer-sales/${saleId}/claim-message`);
        const data = await res.json();
        setClaimData(data);
      } catch (err) {
        console.error('Error fetching claim message:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [saleId]);

  if (!saleId) return null;

  const handleCopy = () => {
    if (!claimData?.messageText) return;
    navigator.clipboard.writeText(claimData.messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenChat = () => {
    if (claimData?.chatUrl) {
      window.open(claimData.chatUrl, '_blank');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await fetch(`/api/customer-sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: saleId,
          status: newStatus
        })
      });
      setStatusSuccess(`اسٹیٹس "${newStatus}" میں تبدیل کر دیا گیا`);
      if (onStatusUpdated) onStatusUpdated();
      setTimeout(() => setStatusSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const sale = claimData?.sale;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 text-white shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                1-کلک وارنٹی کلیم جنریٹر (Warranty Claim Assistant)
              </h2>
              <p className="text-xs text-slate-400">
                وینڈر کو بھیجنے کے لیے آٹو میسج اور براہ راست رابطہ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
              <p className="text-xs">وینڈر اور آرڈر ریکارڈ تلاش ہو رہا ہے...</p>
            </div>
          ) : (
            <>
              {/* Order & Vendor Summary Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      پراڈکٹ
                    </span>
                    <span className="text-sm font-bold text-white">
                      {sale?.product_name}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({sale?.duration})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      متاثرہ گاہک
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {sale?.customer_name} ({sale?.customer_contact})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">سپلائر وینڈر:</span>
                    <span className="font-semibold text-indigo-400">{claimData?.vendorName || 'نامعلوم'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">پلیٹ فارم رابطہ:</span>
                    <span className="font-semibold text-slate-200">{claimData?.identifier || 'موجود نہیں'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">وارنٹی کی مدت:</span>
                    <span className="font-semibold text-amber-400">{sale?.warranty_days} دن</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">اسٹیٹس:</span>
                    <span className={`font-bold ${
                      sale?.status === 'Active' ? 'text-emerald-400' :
                      sale?.status === 'Claimed' ? 'text-amber-400' :
                      sale?.status === 'Replaced' ? 'text-sky-400' : 'text-slate-400'
                    }`}>
                      {sale?.status}
                    </span>
                  </div>
                </div>

                {sale?.credentials && (
                  <div className="mt-2 pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block mb-1">خراب اکاؤنٹ اسناد (Credentials):</span>
                    <code className="px-2 py-1 rounded bg-slate-900 text-rose-400 font-mono text-xs block truncate border border-slate-800">
                      {sale.credentials}
                    </code>
                  </div>
                )}
              </div>

              {/* Pre-filled Message Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-indigo-400" />
                    <span>وینڈر کے لیے تیار شدہ کلیم میسج (Pre-filled Claim Message):</span>
                  </label>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'کاپی ہو گیا!' : 'کاپی کریں'}</span>
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    readOnly
                    value={claimData?.messageText || ''}
                    rows={6}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 select-all"
                  />
                </div>
              </div>

              {/* Action Buttons: Chat & Status Update */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md ${
                      copied
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'میسج کاپی ہو گیا!' : 'کلیم میسج کاپی کریں'}</span>
                  </button>

                  {claimData?.chatUrl ? (
                    <button
                      onClick={handleOpenChat}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>وینڈر کی چیٹ کھولیں ({claimData.platform})</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center py-2.5 px-4 rounded-xl text-xs text-slate-400 bg-slate-900 border border-slate-800">
                      چیٹ لنک دستیاب نہیں
                    </div>
                  )}
                </div>

                {/* Quick Status Changers */}
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">
                      سیل کا اسٹیٹس تبدیل کریں:
                    </span>
                    {statusSuccess && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {statusSuccess}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUpdateStatus('Claimed')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-semibold transition-all"
                    >
                      ⚠️ کلیم جاری ہے (Claimed)
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('Replaced')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 text-xs font-semibold transition-all"
                    >
                      🔄 ریپلیسمنٹ مل گئی (Replaced)
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('Refunded')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-semibold transition-all"
                    >
                      💸 ریفنڈ ہو گیا (Refunded)
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('Active')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-semibold transition-all"
                    >
                      ✅ فعال / حل شدہ (Active)
                    </button>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
          >
            بند کریں (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
