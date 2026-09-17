import React, { useState } from 'react';
import { AlertOctagon, Plus, Search, DollarSign, Skull, CheckCircle2, Clock, Trash2 } from 'lucide-react';

export default function IssuesView({ 
  issues, 
  onOpenAddIssue, 
  onDeleteIssue 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResponse, setFilterResponse] = useState('All');

  const filtered = issues.filter((i) => {
    const matchesFilter = filterResponse === 'All' || i.seller_response === filterResponse;
    const matchesSearch = 
      i.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.notes && i.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const totalLoss = issues.reduce((acc, i) => acc + (Number(i.financial_loss) || 0), 0);
  const severeCount = issues.filter(i => i.seller_response === 'Blocked' || i.seller_response === 'No Response').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              شکایات اور مالی نقصانات کا ریکارڈ (Issues & Loss Log)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            کس وینڈر نے کتنے دن بعد اکاؤنٹ بند کیا، کتنا مالی نقصان ہوا، اور سیلر کا ردعمل کیا رہا۔
          </p>
        </div>

        <button
          onClick={onOpenAddIssue}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>نئی شکایت درج کریں</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <span className="text-xs text-rose-400 font-medium block mb-1">کل مالی نقصان (Total Financial Loss)</span>
          <span className="text-2xl font-extrabold text-rose-400">${totalLoss.toFixed(2)}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block mb-1">کل شکایات (Total Issues)</span>
          <span className="text-xl font-extrabold text-white">{issues.length} کیسز</span>
        </div>
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <span className="text-xs text-orange-400 font-medium block mb-1">سنگین فراڈ و بلاک (Severe Frauds)</span>
          <span className="text-xl font-extrabold text-orange-300">{severeCount} وینڈرز</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['All', 'Blocked', 'No Response', 'Replacement Provided', 'Resolved'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterResponse(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterResponse === r
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {r === 'All' ? 'تمام شکایات' : r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="وینڈر، عنوان یا نوٹ تلاش کریں..."
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
                <th className="py-3.5 px-4 font-semibold">وینڈر</th>
                <th className="py-3.5 px-4 font-semibold">مسئلہ / عنوان</th>
                <th className="py-3.5 px-4 font-semibold">نوعیت (Issue Type)</th>
                <th className="py-3.5 px-4 font-semibold">مالی نقصان ($ Loss)</th>
                <th className="py-3.5 px-4 font-semibold">وینڈر کا ردعمل (Response)</th>
                <th className="py-3.5 px-4 font-semibold">تاریخ</th>
                <th className="py-3.5 px-4 font-semibold">تفصیل / نوٹس</th>
                <th className="py-3.5 px-4 font-semibold text-right">ایکشن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    کوئی شکایت درج نہیں ہے۔
                  </td>
                </tr>
              ) : (
                filtered.map((issue) => {
                  const isBlocked = issue.seller_response === 'Blocked' || issue.seller_response === 'No Response';
                  const isResolved = issue.seller_response === 'Resolved' || issue.seller_response === 'Replacement Provided';

                  return (
                    <tr key={issue.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {issue.vendor_name}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {issue.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
                          {issue.issue_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-sm text-rose-400">
                        {issue.financial_loss > 0 ? `-$${Number(issue.financial_loss).toFixed(2)}` : '$0.00'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isBlocked
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : isResolved
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {issue.seller_response}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs italic max-w-[200px] truncate">
                        {issue.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteIssue(issue.id)}
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
