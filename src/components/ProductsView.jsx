import React, { useState } from 'react';
import { Package, Plus, Search, Tag, ExternalLink, ArrowRight, Trash2, Edit3, Store, ShieldCheck } from 'lucide-react';

export default function ProductsView({ 
  products, 
  onSelectProductCompare, 
  onOpenAddProduct, 
  onOpenAddOffer, 
  onDeleteProduct 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              پراڈکٹس کی کیٹلاگ (Products Catalog)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            آپ کے تمام ڈیجیٹل اکاؤنٹس اور یہ کس کس وینڈر کے پاس کس ریٹ پر دستیاب ہیں۔
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddOffer()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>نئی وینڈر آفر شامل کریں</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>نئی پراڈکٹ بنائیں</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="پراڈکٹ کا نام یا کیٹیگری تلاش کریں..."
          className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((prod) => (
          <div
            key={prod.id}
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-extrabold text-white">{prod.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium mt-1 inline-block">
                    {prod.category || 'General'}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteProduct(prod.id)}
                  title="ڈیلیٹ کریں"
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {prod.description && (
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {prod.description}
                </p>
              )}

              {prod.safety_guidelines && (
                <div className="mt-2.5 p-2 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2" title={prod.safety_guidelines}>
                    {prod.safety_guidelines}
                  </span>
                </div>
              )}

              {/* Offer Statistics */}
              <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">دستیاب وینڈرز</span>
                  <span className="font-extrabold text-white text-sm">
                    {prod.offer_count} وینڈرز
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">سب سے سستا ریٹ</span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    {prod.min_price !== null ? `$${prod.min_price.toFixed(2)}` : 'کوئی نہیں'}
                  </span>
                </div>
              </div>

              {/* ========================================================= */}
              {/* VENDORS SELLING THIS PRODUCT (حل: پراڈکٹ اور وینڈرز)        */}
              {/* ========================================================= */}
              <div className="mt-3 space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  <span>یہ پراڈکٹ ان وینڈرز کے پاس ہے:</span>
                </span>
                {prod.vendor_offers && prod.vendor_offers.length > 0 ? (
                  <div className="space-y-1 pt-1 max-h-24 overflow-y-auto">
                    {prod.vendor_offers.map((vo) => (
                      <div 
                        key={vo.id} 
                        className="flex items-center justify-between text-[11px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-slate-200 font-medium truncate">{vo.vendor_name}</span>
                          <span className="text-[9px] text-slate-400">({vo.duration})</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          ${vo.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic pt-0.5">
                    ابھی کوئی وینڈر اٹیچ نہیں ہے۔ "ریٹ جوڑیں" دبائیں۔
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenAddOffer(null, prod.id)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>وینڈر / ریٹ جوڑیں</span>
              </button>

              <button
                onClick={() => onSelectProductCompare(prod.name)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all flex items-center gap-1"
              >
                <span>موازنہ دیکھیں</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
