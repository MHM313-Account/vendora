import React, { useState } from 'react';
import { RotateCcw, Plus, CheckCircle2, Clock, XCircle, AlertTriangle, Search, Trash2 } from 'lucide-react';

export default function ReplacementsView({ 
  replacements, 
  onOpenAddReplacement, 
  onUpdateReplacementStatus,
  onDeleteReplacement 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = replacements.filter((r) => {
    const matchesFilter = filterStatus === 'All' || r.status === filterStatus;
    const matchesSearch = 
      r.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const pendingCount = replacements.filter(r => r.status === 'Pending').length;
  const successCount = replacements.filter(r => r.status === 'Successful').length;
  const failedCount = replacements.filter(r => r.status === 'Failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RotateCcw className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              وارنٹی اور ریپلیسمنٹ ٹریکر (Replacement Lifecycle)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            جب کوئی اکاؤنٹ بند ہو تو ریپلیسمنٹس کی نیسٹڈ ہسٹری (اصل ➔ ریپلیسمنٹ #1 ➔ ریپلیسمنٹ #2) اور حل ٹریک کریں۔
          </p>
        </div>

        <button
          onClick={onOpenAddReplacement}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>نیا ریپلیسمنٹ کلیم درج کریں</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-xs text-amber-400 font-medium block mb-1">زیرِ انتظار (Pending Replacements)</span>
          <span className="text-xl font-extrabold text-amber-300">{pendingCount} کیسز</span>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-xs text-emerald-400 font-medium block mb-1">کامیاب متبادل (Resolved)</span>
          <span className="text-xl font-extrabold text-emerald-300">{successCount} اکاؤنٹس</span>
        </div>
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <span className="text-xs text-rose-400 font-medium block mb-1">ناکام ریپلیسمنٹس (Failed)</span>
          <span className="text-xl font-extrabold text-rose-300">{failedCount} کیسز</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['All', 'Pending', 'Successful', 'Failed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === s
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s === 'All' ? 'تمام' : s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="وینڈر، پراڈکٹ یا نوٹ تلاش کریں..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">کلیم نمبر</th>
                <th className="py-3.5 px-4 font-semibold">وینڈر</th>
                <th className="py-3.5 px-4 font-semibold">پراڈکٹ</th>
                <th className="py-3.5 px-4 font-semibold">درخواست کی تاریخ</th>
                <th className="py-3.5 px-4 font-semibold">اسٹیٹس (Status)</th>
                <th className="py-3.5 px-4 font-semibold">نوٹس / ردعمل</th>
                <th className="py-3.5 px-4 font-semibold text-right">ایکشن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    کوئی ریپلیسمنٹ کلیم درج نہیں ہے۔
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const isPending = r.status === 'Pending';
                  const isSuccess = r.status === 'Successful';
                  const isFailed = r.status === 'Failed';

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs border border-indigo-500/30">
                          Replacement #{r.replacement_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {r.vendor_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        {r.product_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(r.request_date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={r.status}
                          onChange={(e) => onUpdateReplacementStatus(r.id, e.target.value, r.notes)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                            isSuccess
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <option value="Pending" className="bg-slate-900 text-amber-400">Pending (زیرِ انتظار)</option>
                          <option value="Successful" className="bg-slate-900 text-emerald-400">Successful (نیا مل گیا)</option>
                          <option value="Failed" className="bg-slate-900 text-rose-400">Failed (وینڈر مکر گیا)</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs italic max-w-[240px] truncate">
                        {r.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteReplacement(r.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
