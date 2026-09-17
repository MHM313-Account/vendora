import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitCommit, 
  Plus, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw,
  Sparkles,
  ArrowRight,
  Shield
} from 'lucide-react';

export default function ReplacementChainModal({ saleId, isOpen, onClose, onOpenClaimModal }) {
  const [chainData, setChainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // New replacement form
  const [newCredentials, setNewCredentials] = useState('');
  const [issueReason, setIssueReason] = useState('اکاؤنٹ بند ہو گیا (Account revoked/expired)');
  const [vendorNotes, setVendorNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Credentials visibility & copied state
  const [visibleCreds, setVisibleCreds] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const loadChain = async () => {
    if (!saleId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/customer-sales/${saleId}/replacements`);
      const data = await res.json();
      setChainData(data);
    } catch (err) {
      console.error('Error loading replacement chain:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && saleId) {
      loadChain();
      setIsAdding(false);
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, saleId]);

  if (!isOpen || !saleId) return null;

  const toggleVisibility = (key) => {
    setVisibleCreds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (key, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddReplacement = async (e) => {
    e.preventDefault();
    if (!newCredentials.trim()) {
      setError('نئے اکاؤنٹ کی اسناد (email:password یا cookie) درج کرنا ضروری ہے');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/customer-sales/${saleId}/replacements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_credentials: newCredentials.trim(),
          issue_reason: issueReason.trim(),
          vendor_notes: vendorNotes.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خرابی پیش آ گئی');

      setSuccessMsg(data.message || 'ریپلیسمنٹ کامیابی سے چین میں جڑ گئی!');
      setNewCredentials('');
      setVendorNotes('');
      setIsAdding(false);
      loadChain();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const sale = chainData?.sale;
  const replacements = chainData?.replacements || [];
  const repCount = replacements.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
              <GitCommit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  اکاؤنٹ ریپلیسمنٹ چین و ٹائم لائن (Warranty Audit Trail)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  {repCount} ریپلیسمنٹ لاگ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                اصل اکاؤنٹ سے لے کر ہر اگلی ریپلیسمنٹ کی مکمل تاریخی چین
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mb-2" />
              <p className="text-xs">ریپلیسمنٹ چین لوڈ ہو رہی ہے...</p>
            </div>
          ) : (
            <>
              {/* Sale Overview Summary Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">پراڈکٹ و گاہک</span>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{sale?.product_name}</span>
                      <span className="text-xs text-slate-400 font-normal">({sale?.duration})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">خریدار / گاہک</span>
                    <span className="text-xs font-semibold text-slate-200">
                      {sale?.customer_name} ({sale?.customer_contact})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">سپلائر وینڈر:</span>
                    <span className="font-semibold text-indigo-400">{sale?.vendor_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">خریداری تاریخ:</span>
                    <span className="font-semibold text-slate-300">{sale?.sale_date?.slice(0, 10)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">وارنٹی کی مدت:</span>
                    <span className="font-semibold text-amber-400">{sale?.warranty_days} دن</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">موجودہ اسٹیٹس:</span>
                    <span className="font-bold text-emerald-400">{sale?.status}</span>
                  </div>
                </div>
              </div>

              {/* Feedback messages */}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Visual Replacement Timeline Chain */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>اکاؤنٹس کی لائف سائیکل اور ریپلیسمنٹس کی چین ({repCount + 1} کل لاگز)</span>
                  </h3>

                  <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAdding ? 'فارم بند کریں' : '+ اگلی ریپلیسمنٹ درج کریں'}</span>
                  </button>
                </div>

                {/* The Add Replacement Form */}
                {isAdding && (
                  <form onSubmit={handleAddReplacement} className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/40 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-indigo-300">
                        ریپلیسمنٹ #{repCount + 1} درج کریں (وینڈر سے ملا نیا اکاؤنٹ):
                      </span>
                      <span className="text-[11px] text-slate-400">
                        موجودہ اکاؤنٹ خود بخود پچھلے ریکارڈ میں محفوظ ہو جائے گا
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        نئی اکاؤنٹ اسناد (New Login Credentials / Cookie) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="new_user@gmail.com:Pass123 یا نیا سیشن کوکی"
                        value={newCredentials}
                        onChange={(e) => setNewCredentials(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          خرابی کی وجہ (Issue Reason)
                        </label>
                        <input
                          type="text"
                          value={issueReason}
                          onChange={(e) => setIssueReason(e.target.value)}
                          placeholder="مثلاً: پاس ورڈ تبدیل ہو گیا / اسکرین لاگ آؤٹ ہو گئی"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          وینڈر کے نوٹس (Vendor / Admin Notes)
                        </label>
                        <input
                          type="text"
                          value={vendorNotes}
                          onChange={(e) => setVendorNotes(e.target.value)}
                          placeholder="مثلاً: وینڈر نے 10 منٹ میں نیا اکاؤنٹ فراہم کیا"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
                      >
                        منسوخ کریں
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{submitting ? 'محفوظ ہو رہا ہے...' : 'چین میں شامل کریں'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Timeline Items */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                  
                  {/* Step 0: Original Initial Account */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow">
                      0
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            اصل اکاؤنٹ (Original Purchase Account)
                          </span>
                          <span className="px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                            ابتدائی آرڈر
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {sale?.sale_date?.slice(0, 10)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <code className="text-xs font-mono text-slate-300 truncate select-all">
                          {visibleCreds['orig'] ? (chainData?.original_credentials || sale?.credentials) : '••••••••••••••••••••'}
                        </code>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleVisibility('orig')}
                            className="p-1 text-slate-400 hover:text-white"
                            title="دیکھیں"
                          >
                            {visibleCreds['orig'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopy('orig', chainData?.original_credentials || sale?.credentials)}
                            className="p-1 text-slate-400 hover:text-indigo-400"
                            title="کاپی کریں"
                          >
                            {copiedKey === 'orig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Steps 1..N: Replacement History */}
                  {replacements.map((r, idx) => {
                    const isLast = idx === replacements.length - 1;
                    const credKey = `rep_${r.id}`;

                    return (
                      <div key={r.id} className="relative">
                        <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow ${
                          isLast ? 'bg-emerald-500' : 'bg-purple-600'
                        }`}>
                          {r.replacement_number}
                        </div>

                        <div className={`p-4 rounded-xl border transition-all space-y-2 ${
                          isLast 
                            ? 'bg-slate-900/90 border-emerald-500/40 shadow-md shadow-emerald-950/20' 
                            : 'bg-slate-900/70 border-slate-800'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                ریپلیسمنٹ #{r.replacement_number}
                              </span>
                              {isLast ? (
                                <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>موجودہ فعال اکاؤنٹ (Current Active)</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">
                                  ختم شدہ / پرانا
                                </span>
                              )}
                            </div>

                            <span className="text-[11px] text-slate-400 font-mono">
                              {r.issue_date ? r.issue_date.slice(0, 10) : ''}
                            </span>
                          </div>

                          {r.issue_reason && (
                            <div className="text-xs text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                              <span>مسئلہ: {r.issue_reason}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                            <code className="text-xs font-mono text-emerald-300 truncate select-all">
                              {visibleCreds[credKey] ? r.new_credentials : '••••••••••••••••••••'}
                            </code>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => toggleVisibility(credKey)}
                                className="p-1 text-slate-400 hover:text-white"
                                title="دیکھیں"
                              >
                                {visibleCreds[credKey] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleCopy(credKey, r.new_credentials)}
                                className="p-1 text-slate-400 hover:text-indigo-400"
                                title="کاپی کریں"
                              >
                                {copiedKey === credKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {r.vendor_notes && (
                            <p className="text-[11px] text-slate-400 italic">
                              نوٹس: "{r.vendor_notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>

              {/* Bottom Quick Action: 1-Click Claim Generator */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      وینڈر کے لیے مکمل کلیم میسج تیار کریں
                    </div>
                    <div className="text-[11px] text-slate-400">
                      میسج میں اصل اکاؤنٹ اور تمام سابقہ {repCount} ریپلیسمنٹس کی تاریخیں خودکار شامل ہوں گی
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenClaimModal(saleId);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>کلیم ونڈو کھولیں</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
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
