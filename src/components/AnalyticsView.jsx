import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  ArrowUpRight,
  PieChart,
  Percent
} from 'lucide-react';

export default function AnalyticsView({ onOpenVendorDetail }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-sm">اینالیٹکس تیار کی جا رہی ہیں...</p>
      </div>
    );
  }

  const vendors = analytics?.vendorPerformance || [];
  const categories = analytics?.categorySpend || [];
  const totalSpent = analytics?.totalSpent || 0;
  const totalLost = analytics?.totalLost || 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              وینڈر اینالیٹکس و حقیقی لاگت (Vendor Performance & Real Cost)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            فیل ہونے والے اکاؤنٹس اور نقصانات کو نکال کر ہر وینڈر کی اصل لاگت (Effective Cost) اور کارکردگی۔
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block mb-1">کل خریداری رقم (Total Spent)</span>
          <span className="text-xl font-extrabold text-white">${totalSpent.toFixed(2)}</span>
        </div>
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <span className="text-xs text-rose-400 font-medium block mb-1">کل مالی نقصان (Total Loss)</span>
          <span className="text-xl font-extrabold text-rose-400">${totalLost.toFixed(2)}</span>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-xs text-emerald-400 font-medium block mb-1">نیٹ موثر بچت (Net Efficiency)</span>
          <span className="text-xl font-extrabold text-emerald-400">
            {totalSpent > 0 ? `${Math.round(((totalSpent - totalLost) / totalSpent) * 100)}%` : '100%'}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <span className="text-xs text-indigo-400 font-medium block mb-1">سب سے بہترین وینڈر</span>
          <span className="text-base font-extrabold text-indigo-300 truncate block">
            {vendors[0]?.name || 'XYZ Store'}
          </span>
        </div>
      </div>

      {/* Real Effective Cost Leaderboard */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span>وینڈر کارکردگی اور اصل لاگت انڈیکس (Effective Cost Leaderboard)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Effective Cost = کل خرچ ÷ کامیاب اکاؤنٹس کی تعداد (فیل ہونے والے اکاؤنٹس کا بوجھ نکال کر)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">وینڈر کا نام</th>
                <th className="py-3.5 px-4 font-semibold">ٹرسٹ اسکور</th>
                <th className="py-3.5 px-4 font-semibold">کل آرڈرز</th>
                <th className="py-3.5 px-4 font-semibold">کامیاب اکاؤنٹس</th>
                <th className="py-3.5 px-4 font-semibold">فیل / نقصانات</th>
                <th className="py-3.5 px-4 font-semibold">کامیابی کا تناسب</th>
                <th className="py-3.5 px-4 font-semibold">کل خرچ ($)</th>
                <th className="py-3.5 px-4 font-semibold text-right">اصل لاگت فی یونٹ (Real Cost)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {vendors.map((v) => {
                const hasFailures = v.failed_accounts > 0;
                return (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onOpenVendorDetail(v.id)}
                        className="font-bold text-white hover:text-indigo-400 transition-colors flex items-center gap-1"
                      >
                        <span>{v.name}</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-indigo-300">{v.trust_score}/100</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {v.total_orders} آرڈرز
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-emerald-400">
                        {v.successful_accounts} یونٹس
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {v.failed_accounts > 0 || v.total_loss > 0 ? (
                        <span className="font-bold text-rose-400">
                          {v.failed_accounts} فیل (-${v.total_loss.toFixed(2)})
                        </span>
                      ) : (
                        <span className="text-slate-500">0 مسئلہ</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.success_rate >= 90 ? 'bg-emerald-500/20 text-emerald-400' :
                        v.success_rate >= 70 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {v.success_rate}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      ${v.total_spend.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-extrabold text-sm">
                        {v.real_cost_per_unit > 0 ? (
                          <span className={hasFailures ? 'text-rose-400' : 'text-emerald-400'}>
                            ${v.real_cost_per_unit.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </div>
                      {hasFailures && (
                        <span className="text-[10px] text-rose-400 block mt-0.5 font-medium">
                          (فیل اکاؤنٹس کی وجہ سے مہنگا پڑا)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Spend Distribution */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-400" />
          <span>کیٹیگری کے لحاظ سے خرچ کی تقسیم (Spend by Category)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold block mb-1">
                {cat.category || 'General'}
              </span>
              <div className="text-xl font-extrabold text-white">
                ${Number(cat.total_spent).toFixed(2)}
              </div>
              <span className="text-[11px] text-indigo-400 block mt-1">
                {cat.order_count} کامیاب آرڈرز
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
