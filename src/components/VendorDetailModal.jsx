import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Package, 
  ShoppingCart, 
  Plus, 
  Clock, 
  CheckCircle2,
  XCircle,
  FileText,
  Send,
  AlertOctagon,
  Image,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

export default function VendorDetailModal({ 
  vendorId, 
  onClose, 
  onOpenAddOffer,
  onOpenAddPurchase,
  onOpenAddIssue,
  onOpenAddEvidence
}) {
  const [vendor, setVendor] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offers'); // 'offers', 'purchases', 'issues', 'evidence', 'notes'
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchVendorDetail = async () => {
    try {
      const [vRes, sRes] = await Promise.all([
        fetch(`/api/vendors/${vendorId}`),
        fetch(`/api/vendors/${vendorId}/warranty-scorecard`)
      ]);
      const [vData, sData] = await Promise.all([
        vRes.json(),
        sRes.json()
      ]);
      setVendor(vData);
      setScorecard(sData);
    } catch (err) {
      console.error('Error fetching vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetail();
    }
  }, [vendorId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await fetch(`/api/vendors/${vendorId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text: newNote })
      });
      setNewNote('');
      fetchVendorDetail();
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  if (!vendorId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-white">{vendor?.name || 'وینڈر پروفائل'}</h2>
              {vendor && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  اسکور: {vendor.trust_score}/100
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                vendor?.trust_status === 'Trusted' ? 'text-emerald-400 bg-emerald-500/15' :
                vendor?.trust_status === 'Scammer' ? 'text-rose-400 bg-rose-500/15' :
                vendor?.trust_status === 'Risky' ? 'text-orange-400 bg-orange-500/15' :
                'text-amber-400 bg-amber-500/15'
              }`}>
                {vendor?.trust_status}
              </span>
              <span className="text-xs text-slate-400">• مکمل انٹیلیجنس پروفائل</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="flex items-center gap-1 px-6 pt-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'offers', label: 'آفرز و ریٹس', count: vendor?.offers?.length || 0, icon: Package },
            { id: 'purchases', label: 'خریداریاں', count: vendor?.purchases?.length || 0, icon: ShoppingCart },
            { id: 'issues', label: 'شکایات و نقصانات', count: vendor?.issues?.length || 0, icon: AlertOctagon, danger: (vendor?.issues?.length || 0) > 0 },
            { id: 'evidence', label: 'ایویڈینس والٹ', count: vendor?.evidence?.length || 0, icon: Image },
            { id: 'notes', label: 'نوٹس لاگ', count: vendor?.notes_list?.length || 0, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 transition-all ${
                  isActive
                    ? 'border-indigo-500 text-white font-bold bg-slate-800/40 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.danger ? 'text-rose-400' : ''}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${tab.danger ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm">وینڈر کی تفصیلات لوڈ ہو رہی ہیں...</p>
          </div>
        ) : !vendor ? (
          <div className="p-12 text-center text-rose-400">وینڈر نہیں ملا</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Platforms Banner */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">رابطے:</span>
                {vendor.platforms && vendor.platforms.length > 0 ? (
                  vendor.platforms.map((p) => (
                    <a
                      key={p.id}
                      href={p.url || '#'}
                      target={p.url ? '_blank' : '_self'}
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500 text-xs text-slate-200 hover:text-white transition-colors"
                    >
                      <span className="font-bold text-indigo-400">{p.platform}:</span>
                      <span className="font-mono text-slate-300">{p.identifier}</span>
                      {p.url && <ExternalLink className="w-3 h-3 text-slate-400" />}
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">کوئی رابطہ درج نہیں</span>
                )}
              </div>

              {/* Quick action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAddOffer(vendor.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  + آفر
                </button>
                <button
                  onClick={() => onOpenAddIssue(vendor.id)}
                  className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30"
                >
                  + شکایت لاگ
                </button>
                <button
                  onClick={() => onOpenAddEvidence(vendor.id)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30"
                >
                  + ثبوت اپلوڈ
                </button>
              </div>
            </div>

            {/* Warranty Speed & Reliability Scorecard */}
            {scorecard && (
              <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>وینڈر وارنٹی رفتار اور وشوسنییتا اسکور کارڈ (Warranty Scorecard)</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    scorecard.reliability_badge?.includes('اعلیٰ') 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : scorecard.reliability_badge?.includes('خطرناک') 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {scorecard.reliability_badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">خرابی کی شرح (Fault Rate)</span>
                    <span className={`text-base font-mono font-bold ${
                      scorecard.fault_rate_percent <= 15 ? 'text-emerald-400' :
                      scorecard.fault_rate_percent <= 35 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {scorecard.fault_rate_percent}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">کل ریپلیسمنٹس</span>
                    <span className="text-base font-mono font-bold text-indigo-300">
                      {scorecard.total_replacements}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">کلیم حل کی رفتار</span>
                    <span className="text-xs font-bold text-white mt-1 block">
                      {scorecard.speed_rating}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">کل خریداریاں</span>
                    <span className="text-base font-mono font-bold text-slate-200">
                      {scorecard.total_purchases}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: OFFERS */}
            {activeTab === 'offers' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>دستیاب پراڈکٹس اور ریٹس ({vendor.offers?.length || 0})</span>
                  <button
                    onClick={() => onOpenAddOffer(vendor.id)}
                    className="text-xs text-indigo-400 hover:underline font-normal"
                  >
                    + نیا ریٹ شامل کریں
                  </button>
                </h3>
                <div className="space-y-2">
                  {vendor.offers && vendor.offers.length > 0 ? (
                    vendor.offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{offer.product_name}</span>
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                              {offer.duration}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-1 flex items-center gap-3">
                            <span>وارنٹی: <strong className="text-slate-300">{offer.warranty}</strong></span>
                            <span>ڈیلیوری: <strong className="text-slate-300">{offer.delivery_method}</strong></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-emerald-400 text-base">
                            ${offer.price.toFixed(2)}
                          </div>
                          <button
                            onClick={() => onOpenAddPurchase(vendor.id, offer.product_id, offer.id, offer.price)}
                            className="mt-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold"
                          >
                            خریداری لاگ کریں
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-6 text-center bg-slate-950/40 rounded-xl">
                      اس وینڈر کے پاس ابھی کوئی پراڈکٹ آفر درج نہیں کی گئی۔
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PURCHASES */}
            {activeTab === 'purchases' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">ماضی کی خریداریاں ({vendor.purchases?.length || 0})</h3>
                <div className="space-y-2">
                  {vendor.purchases && vendor.purchases.length > 0 ? (
                    vendor.purchases.map((p) => {
                      const isSuccess = p.result === 'Successful';
                      return (
                        <div
                          key={p.id}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{p.product_name}</span>
                              <span className="text-slate-400">({p.quantity} تعداد)</span>
                            </div>
                            {p.notes && <p className="text-[11px] text-slate-400 mt-0.5 italic">"{p.notes}"</p>}
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              تاریخ: {new Date(p.purchase_date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-200 block">${(p.price * p.quantity).toFixed(2)}</span>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {p.result}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 py-6 text-center bg-slate-950/40 rounded-xl">
                      ابھی تک اس وینڈر سے کوئی خریداری نہیں ہوئی۔
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ISSUES & FINANCIAL LOSSES */}
            {activeTab === 'issues' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <span>شکایات اور مالی نقصانات ({vendor.issues?.length || 0})</span>
                  </h3>
                  <button
                    onClick={() => onOpenAddIssue(vendor.id)}
                    className="text-xs text-rose-400 hover:underline font-semibold"
                  >
                    + نئی شکایت درج کریں
                  </button>
                </div>

                <div className="space-y-2">
                  {vendor.issues && vendor.issues.length > 0 ? (
                    vendor.issues.map((iss) => (
                      <div key={iss.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-900/30 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-white text-sm block">{iss.title}</span>
                            <span className="text-[10px] text-slate-400">{iss.issue_type} • {new Date(iss.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right">
                            {iss.financial_loss > 0 && (
                              <span className="font-extrabold text-rose-400 text-sm block">-${Number(iss.financial_loss).toFixed(2)}</span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 mt-1 inline-block">
                              {iss.seller_response}
                            </span>
                          </div>
                        </div>
                        {iss.notes && (
                          <p className="mt-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg italic">
                            "{iss.notes}"
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                      <p className="text-xs text-emerald-300 font-semibold">کوئی شکایت یا مالی نقصان ریکارڈ نہیں ہے۔</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">یہ وینڈر اب تک کلین ریکارڈ رکھتا ہے۔</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: EVIDENCE VAULT */}
            {activeTab === 'evidence' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-indigo-400" />
                    <span>محفوظ شدہ ثبوت و اسکرین شاٹس ({vendor.evidence?.length || 0})</span>
                  </h3>
                  <button
                    onClick={() => onOpenAddEvidence(vendor.id)}
                    className="text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    + نیا ثبوت اپلوڈ کریں
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vendor.evidence && vendor.evidence.length > 0 ? (
                    vendor.evidence.map((ev) => (
                      <div key={ev.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                        {ev.image_data && (
                          <img src={ev.image_data} alt={ev.title} className="h-28 w-full object-cover rounded-lg mb-2" />
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 mb-1 inline-block">
                          {ev.evidence_type}
                        </span>
                        <h4 className="font-bold text-white text-xs line-clamp-1">{ev.title}</h4>
                        {ev.notes && <p className="text-[11px] text-slate-400 mt-1 italic">"{ev.notes}"</p>}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-6 text-center bg-slate-950/40 rounded-xl text-slate-400 text-xs">
                      کوئی اسکرین شاٹ یا ثبوت موجود نہیں ہے۔
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="نیا نوٹ درج کریں (مثلاً: 10 منٹ میں اکاؤنٹ دیا، سپورٹ اچھی ہے...)"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={addingNote || !newNote.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>محفوظ کریں</span>
                  </button>
                </form>

                <div className="space-y-2">
                  {vendor.notes_list && vendor.notes_list.length > 0 ? (
                    vendor.notes_list.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                        <p className="text-slate-300">"{n.note_text}"</p>
                        <span className="text-[10px] text-slate-500 block mt-1.5">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">کوئی نوٹ موجود نہیں ہے۔</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
