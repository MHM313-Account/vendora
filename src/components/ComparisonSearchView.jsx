import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Scale, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Skull, 
  ShoppingCart, 
  CheckCircle2, 
  XCircle,
  Clock,
  Sparkles,
  ArrowUpDown,
  Filter
} from 'lucide-react';

export default function ComparisonSearchView({ 
  searchQuery, 
  setSearchQuery, 
  onOpenVendorDetail,
  onLogPurchaseFromOffer
}) {
  const [results, setResults] = useState({ offers: [], comparison: {} });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('effective_asc'); // 'effective_asc', 'price_asc', 'trust_desc'

  const fetchComparison = async (query) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query || 'CapCut')}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(searchQuery || 'CapCut');
  }, [searchQuery]);

  const getTrustBadge = (status, score) => {
    switch (status) {
      case 'Trusted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            🟢 قابلِ اعتماد ({score}/100)
          </span>
        );
      case 'Untested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            🟡 غیر آزمودہ ({score}/100)
          </span>
        );
      case 'Risky':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
            🟠 خطرناک ({score}/100)
          </span>
        );
      case 'Scammer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            🔴 فراڈ ({score}/100)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">
            ⚫ غیر فعال
          </span>
        );
    }
  };

  const getPlatformBadge = (platform, identifier) => {
    let color = 'bg-slate-800 text-slate-300 border-slate-700';
    if (platform === 'Telegram') color = 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    if (platform === 'WhatsApp') color = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    if (platform === 'Discord') color = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    if (platform === 'Website') color = 'bg-purple-500/15 text-purple-300 border-purple-500/30';

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs border ${color}`}>
        <span className="font-semibold">{platform}:</span>
        <span className="font-mono text-[11px]">{identifier || 'Link'}</span>
      </span>
    );
  };

  const productsList = Object.keys(results.comparison || {});

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                سپلائر قیمت، اصل لاگت و کوالٹی موازنہ (Supplier Comparison)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              ہر وینڈر کے ظاہری ریٹ کے ساتھ ساتھ فیل شدہ اکاؤنٹس کو نکال کر **اصل لاگت (Effective Real Cost)** کا آمنے سامنے موازنہ کریں۔
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">ترتیب دیں:</span>
            <button
              onClick={() => setSortBy('effective_asc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                sortBy === 'effective_asc'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              اصل لاگت کے لحاظ سے سستا (Effective) 🧮
            </button>
            <button
              onClick={() => setSortBy('price_asc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                sortBy === 'price_asc'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              ظاہری قیمت کم ↓
            </button>
            <button
              onClick={() => setSortBy('trust_desc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                sortBy === 'trust_desc'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              اعلیٰ ٹرسٹ اسکور ⭐
            </button>
          </div>
        </div>

        {/* Quick Search Chips */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">مشہور پراڈکٹس:</span>
          {['CapCut Pro', 'Claude Pro', 'ChatGPT Plus', 'Canva Pro'].map((item) => (
            <button
              key={item}
              onClick={() => {
                setSearchQuery(item);
                fetchComparison(item);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                searchQuery === item
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Tables per Product */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-sm">وینڈرز کی معلومات اور اصل لاگت جمع کی جا رہی ہے...</p>
        </div>
      ) : productsList.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          <p className="text-base font-semibold text-slate-300 mb-1">کوئی ریکارڈ نہیں ملا</p>
          <p className="text-xs">براہ کرم کوئی دوسرا لفظ تلاش کریں یا نیا وینڈر و ریٹ شامل کریں۔</p>
        </div>
      ) : (
        productsList.map((productName) => {
          let offers = [...results.comparison[productName]];
          if (sortBy === 'effective_asc') {
            offers.sort((a, b) => (a.effective_cost || a.price) - (b.effective_cost || b.price));
          } else if (sortBy === 'price_asc') {
            offers.sort((a, b) => a.price - b.price);
          } else {
            offers.sort((a, b) => b.trust_score - a.trust_score);
          }

          return (
            <div
              key={productName}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Product Header */}
              <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span>{productName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                      {offers.length} سپلائرز دستیاب
                    </span>
                  </h3>
                </div>
                <div className="text-xs text-slate-400">
                  سب سے سستی اصل لاگت: <strong className="text-emerald-400 font-bold">${(offers[0]?.effective_cost || offers[0]?.price).toFixed(2)}</strong>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">درجہ / وینڈر</th>
                      <th className="py-3.5 px-4 font-semibold">پلیٹ فارم</th>
                      <th className="py-3.5 px-4 font-semibold">ظاہری قیمت (Listing)</th>
                      <th className="py-3.5 px-4 font-semibold text-emerald-300">اصل لاگت (Effective Cost)</th>
                      <th className="py-3.5 px-4 font-semibold">وارنٹی و ڈیلیوری</th>
                      <th className="py-3.5 px-4 font-semibold">اسٹیٹس و ٹرسٹ اسکور</th>
                      <th className="py-3.5 px-4 font-semibold">ماضی کا ریکارڈ</th>
                      <th className="py-3.5 px-4 font-semibold text-right">ایکشن</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {offers.map((offer, idx) => {
                      const isBestEffective = idx === 0 && sortBy === 'effective_asc';
                      const isScammer = offer.trust_status === 'Scammer';
                      const effectiveHigher = offer.is_higher_effective;

                      return (
                        <tr
                          key={offer.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isScammer
                              ? 'bg-rose-950/10'
                              : isBestEffective
                              ? 'bg-emerald-950/10'
                              : ''
                          }`}
                        >
                          {/* Vendor & Rank */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-slate-300">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                              </span>
                              <button
                                onClick={() => onOpenVendorDetail(offer.vendor_id)}
                                className="font-bold text-white hover:text-indigo-400 transition-colors text-left flex items-center gap-1 group"
                              >
                                <span>{offer.vendor_name}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            </div>
                          </td>

                          {/* Platform */}
                          <td className="py-3.5 px-4">
                            {getPlatformBadge(offer.platform, offer.identifier)}
                          </td>

                          {/* Listing Price */}
                          <td className="py-3.5 px-4">
                            <span className="text-sm font-bold text-slate-300 line-through-none font-mono">
                              ${offer.price.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{offer.duration}</span>
                          </td>

                          {/* Real Effective Cost */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-base font-extrabold font-mono ${
                                effectiveHigher ? 'text-rose-400' : isBestEffective ? 'text-emerald-400' : 'text-slate-100'
                              }`}>
                                ${(offer.effective_cost || offer.price).toFixed(2)}
                              </span>
                              {isBestEffective && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                  اصل میں سستا
                                </span>
                              )}
                            </div>
                            {effectiveHigher && (
                              <span className="text-[10px] text-rose-400 block font-medium">
                                ⚠ فیل ہونے کی وجہ سے مہنگا
                              </span>
                            )}
                          </td>

                          {/* Warranty & Delivery */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-indigo-400" />
                              <span className="font-semibold text-slate-200">{offer.warranty}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{offer.delivery_method}</span>
                          </td>

                          {/* Trust Status */}
                          <td className="py-3.5 px-4">
                            {getTrustBadge(offer.trust_status, offer.trust_score)}
                          </td>

                          {/* Purchase History */}
                          <td className="py-3.5 px-4">
                            <div className="text-[11px] space-y-0.5">
                              <div className="flex items-center gap-1 text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{offer.vendor_successful_purchases || 0} کامیاب</span>
                              </div>
                              {offer.vendor_failed_purchases > 0 && (
                                <div className="flex items-center gap-1 text-rose-400 font-bold">
                                  <XCircle className="w-3 h-3" />
                                  <span>{offer.vendor_failed_purchases} فیل ہوئے</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => onLogPurchaseFromOffer(offer)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1 ml-auto"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>خریداری لاگ</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
