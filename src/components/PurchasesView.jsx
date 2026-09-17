import React, { useState } from 'react';
import { ShoppingCart, Plus, Search, CheckCircle2, XCircle, RotateCcw, Clock, Trash2 } from 'lucide-react';

export default function PurchasesView({ 
  purchases, 
  onOpenAddPurchase, 
  onOpenAddReplacement,
  onDeletePurchase 
}) {
  const [filterResult, setFilterResult] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = purchases.filter((p) => {
    const matchesFilter = filterResult === 'All' || p.result === filterResult;
    const matchesSearch = 
      p.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const totalSpent = purchases
    .filter(p => p.result === 'Successful')
    .reduce((acc, p) => acc + (p.price * p.quantity), 0);

  const successfulCount = purchases.filter(p => p.result === 'Successful').length;
  const successRate = purchases.length > 0 ? Math.round((successfulCount / purchases.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              خریداری کا ریکارڈ (Purchase History Log)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            تمام آرڈرز، وارنٹی کاؤنٹ ڈاؤن ٹائمر اور ریپلیسمنٹ کلیم کا آپشن۔
          </p>
        </div>

        <button
          onClick={() => onOpenAddPurchase()}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>نئی خریداری لاگ کریں</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block mb-1">کل خریداریاں</span>
          <span className="text-xl font-extrabold text-white">{purchases.length} آرڈرز</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block mb-1">کامیابی کا تناسب (Success Rate)</span>
          <span className="text-xl font-extrabold text-emerald-400">{successRate}%</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block mb-1">کل کامیاب خرچ (Total Spent)</span>
          <span className="text-xl font-extrabold text-teal-400">${totalSpent.toFixed(2)}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['All', 'Successful', 'Failed', 'Replaced', 'Refunded'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterResult(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterResult === r
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {r === 'All' ? 'تمام آرڈرز' : r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="وینڈر، پراڈکٹ یا نوٹ..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">وینڈر</th>
                <th className="py-3.5 px-4 font-semibold">پراڈکٹ</th>
                <th className="py-3.5 px-4 font-semibold">قیمت و تعداد</th>
                <th className="py-3.5 px-4 font-semibold">کل رقم</th>
                <th className="py-3.5 px-4 font-semibold">وارنٹی اسٹیٹس</th>
                <th className="py-3.5 px-4 font-semibold">نتیجہ (Result)</th>
                <th className="py-3.5 px-4 font-semibold">نوٹس</th>
                <th className="py-3.5 px-4 font-semibold text-right">ایکشن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    کوئی ریکارڈ نہیں ملا۔
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isSuccess = p.result === 'Successful';
                  const isFailed = p.result === 'Failed';
                  const isWarrantyActive = p.warranty_active;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {p.vendor_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200">{p.product_name}</span>
                        {p.duration && (
                          <span className="text-[10px] text-slate-400 block">{p.duration}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-300">${p.price.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400"> × {p.quantity}</span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-white text-sm">
                        ${(p.price * p.quantity).toFixed(2)}
                      </td>

                      {/* Warranty Countdown */}
                      <td className="py-3.5 px-4">
                        {isWarrantyActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <Clock className="w-3 h-3" />
                            <span>فعال ({p.days_left} دن باقی)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                            <span>ختم شدہ (Expired)</span>
                          </span>
                        )}
                      </td>

                      {/* Result Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isSuccess
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : isFailed
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                          {isFailed && <XCircle className="w-3 h-3" />}
                          <span>{p.result}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 italic max-w-[180px] truncate">
                        {p.notes || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenAddReplacement(p.id)}
                            className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-[10px] font-bold border border-indigo-500/30 transition-all flex items-center gap-1"
                            title="ریپلیسمنٹ کلیم کریں"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>ریپلیسمنٹ کلیم</span>
                          </button>
                          <button
                            onClick={() => onDeletePurchase(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
