import React, { useState } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  Search,
  Plus,
  Scale,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Clock,
  ExternalLink,
  Store,
  KeyRound,
  Flame,
  BadgePercent,
  Wallet,
  BellRing,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function DashboardView({ 
  dashboardData, 
  onSelectProductCompare, 
  setCurrentTab,
  onOpenVendorDetail,
  onOpenAddVendor,
  onOpenAddPurchase,
  onOpenSmartParser,
  onOpenPriceList
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' or 'offers'
  
  // Dual-Currency PKR / USD state
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'PKR'
  const [exchangeRate, setExchangeRate] = useState(280);
  const [showRateEdit, setShowRateEdit] = useState(false);

  const stats = dashboardData?.stats || {
    totalVendors: 0,
    trustedCount: 0,
    untestedCount: 0,
    riskyCount: 0,
    scammerCount: 0,
    totalProducts: 0,
    totalPurchases: 0,
    totalSpent: 0,
    totalProfit: 0,
    totalSales: 0,
    inStockCount: 0,
    totalUdhaar: 0,
    lowStockCount: 0,
    expiringSoonCount: 0
  };

  const formatMoney = (amountInUsd) => {
    const val = Number(amountInUsd || 0);
    if (currency === 'PKR') {
      const pkrVal = Math.round(val * exchangeRate);
      return `Rs. ${pkrVal.toLocaleString('en-PK')}`;
    }
    return `$${val.toFixed(2)}`;
  };

  const quickPills = [
    { name: 'CapCut Pro', query: 'CapCut', badge: 'سب سے زیادہ مطلوب' },
    { name: 'Claude Pro', query: 'Claude', badge: 'AI Tool' },
    { name: 'ChatGPT Plus', query: 'ChatGPT', badge: 'AI Tool' },
    { name: 'Canva Pro', query: 'Canva', badge: 'Design' },
  ];

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (localSearch.trim()) {
      onSelectProductCompare(localSearch.trim());
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Dual-Currency (PKR / USD) Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-850 border border-slate-700/80 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">کرنسی منتخب کریں (Currency):</span>
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                currency === 'USD' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇺🇸 USD ($)
            </button>
            <button
              onClick={() => setCurrency('PKR')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                currency === 'PKR' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇵🇰 PKR (روپے)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>ایکسچینج ریٹ:</span>
          {showRateEdit ? (
            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-700">
              <span className="text-slate-300 font-mono text-[11px]">$1 =</span>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
                className="w-16 bg-transparent text-emerald-300 font-mono text-xs focus:outline-none text-center font-bold"
              />
              <span className="text-slate-300 text-[11px]">PKR</span>
              <button
                onClick={() => setShowRateEdit(false)}
                className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold"
              >
                ٹھیک ہے
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowRateEdit(true)}
              className="font-mono text-slate-200 hover:text-emerald-300 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold flex items-center gap-1"
              title="ایکسچینج ریٹ تبدیل کریں"
            >
              <span>$1 = {exchangeRate} PKR</span>
              <span className="text-[10px] text-slate-400">✏️</span>
            </button>
          )}
        </div>
      </div>

      {/* Urgent Operational Banners (Low Stock & Renewals) */}
      {(stats.lowStockCount > 0 || stats.expiringSoonCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Low Stock Banner */}
          {stats.lowStockCount > 0 && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/40 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>کم اسٹاک الرٹ! ({stats.lowStockCount} پراڈکٹس)</span>
                  </div>
                  <div className="text-[11px] text-rose-200/80">
                    اسٹاک میں 1 یا اس سے کم اکاؤنٹ بچے ہیں، فورا ری اسٹاک کریں۔
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('vault')}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
              >
                والٹ دیکھیں
              </button>
            </div>
          )}

          {/* Expiring Soon Renewal Banner */}
          {stats.expiringSoonCount > 0 && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <BellRing className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>رینیوول الرٹ! ({stats.expiringSoonCount} کسٹمرز)</span>
                  </div>
                  <div className="text-[11px] text-amber-200/80">
                    اگلے 48 گھنٹوں میں وارنٹی ختم ہو رہی ہے، ریمائنڈر بھیجیں۔
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('sales')}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
              >
                سیلز دیکھیں
              </button>
            </div>
          )}
        </div>
      )}

      {/* 1. Compact & Crisp Eye-Friendly Search Section */}
      <div className="rounded-2xl bg-slate-800/90 border border-slate-700/80 p-6 shadow-md backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-300">100% لوکل ڈیٹا بیس فعال و محفوظ ہے</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              آج آپ کو کس سروس کا ریٹ تلاش کرنا ہے؟
            </h2>
          </div>

          {/* Quick Clickable Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-300 font-semibold">مشہور سروسز:</span>
            {quickPills.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => onSelectProductCompare(p.query)}
                className="px-3 py-1.5 rounded-xl bg-slate-700/80 hover:bg-indigo-600 hover:text-white text-slate-200 text-xs font-semibold border border-slate-600 hover:border-indigo-400 transition-all shadow-sm"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Crisp Spotlight Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative mt-4">
          <Search className="w-4 h-4 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="مثلاً: CapCut Pro, Claude, ChatGPT, Canva یا وینڈر کا نام لکھیں..."
            className="w-full bg-slate-900 border border-slate-600 focus:border-indigo-400 rounded-xl pl-11 pr-32 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <span>ریٹ دیکھیں</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 2. Three Big Friendly Action Cards (High Contrast, Easy to Read) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action 1: Compare Rates */}
        <div
          onClick={() => setCurrentTab('comparison')}
          className="p-5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/60 transition-all duration-150 cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 group-hover:bg-indigo-600 text-indigo-300 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0 shadow-inner">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                ریٹس کا موازنہ کریں
              </h3>
              <p className="text-xs text-slate-300 font-medium">تمام سپلائرز کے ریٹس اور وارنٹی</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 text-xs text-indigo-300 font-bold group-hover:translate-x-1 transition-transform">
            <span>موازنہ اسکرین کھولیں</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Action 2: Add New Vendor */}
        <div
          onClick={onOpenAddVendor}
          className="p-5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 transition-all duration-150 cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-600 text-emerald-300 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0 shadow-inner">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                نیا وینڈر شامل کریں
              </h3>
              <p className="text-xs text-slate-300 font-medium">سپلائر اور اس کے ریٹس درج کریں</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 text-xs text-emerald-300 font-bold group-hover:translate-x-1 transition-transform">
            <span>نیا فارم کھولیں</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Action 3: Log Purchase */}
        <div
          onClick={onOpenAddPurchase}
          className="p-5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/60 transition-all duration-150 cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 group-hover:bg-blue-600 text-blue-300 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0 shadow-inner">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                خریداری درج کریں
              </h3>
              <p className="text-xs text-slate-300 font-medium">آرڈر، قیمت اور وارنٹی لاگ کریں</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 text-xs text-blue-300 font-bold group-hover:translate-x-1 transition-transform">
            <span>خریداری لاگ فارم</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Smart Parser & Price List Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Smart Parser Banner */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-purple-500/30 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                وینڈر کا ریٹ لسٹ میسج پارس کریں
              </div>
              <div className="text-xs text-slate-300">
                پراڈکٹ، مدت، قیمت اور وینڈر خود بخود الگ کر کے محفوظ کریں
              </div>
            </div>
          </div>
          <button
            onClick={onOpenSmartParser}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex-shrink-0 shadow-md shadow-purple-600/20"
          >
            اسمارٹ پارسر ⚡
          </button>
        </div>

        {/* Price List Generator Banner */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-emerald-500/30 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
              <BadgePercent className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                گاہکوں کے لیے ریٹ لسٹ جنریٹر
              </div>
              <div className="text-xs text-slate-300">
                اپنا منافع شامل کر کے واٹس ایپ/ٹیلیگرام میسج 1-کلک میں کاپی کریں
              </div>
            </div>
          </div>
          {onOpenPriceList && (
            <button
              onClick={onOpenPriceList}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex-shrink-0 shadow-md shadow-emerald-600/20"
            >
              ریٹ لسٹ بنائیں 🚀
            </button>
          )}
        </div>
      </div>

      {/* Feature 6: Arbitrage & Flash Deal Alerts */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-850 to-slate-900 border border-amber-500/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                فلیش ڈیل و آربٹریج مواقع (Arbitrage & Flash Deals)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                زیادہ منافع
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              مختلف وینڈرز کے سستے ترین ریٹس دستیاب ہیں جن پر آپ 30% سے 60% تک منافع کما سکتے ہیں۔
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab('comparison')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            سستے ریٹس دیکھیں
          </button>
          {onOpenPriceList && (
            <button
              onClick={onOpenPriceList}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            >
              گاہکوں کے لیے لسٹ بنائیں
            </button>
          )}
        </div>
      </div>

      {/* 3. Comprehensive Reseller & Operational Metrics (5 Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Net Profit */}
        <div 
          onClick={() => setCurrentTab('sales')}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-800 to-slate-850 border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">خالص منافع</span>
            <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl md:text-2xl font-extrabold text-white font-mono mb-2">
            {formatMoney(stats.totalProfit || 0)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-200 pt-3 border-t border-slate-700/60 font-semibold">
            <span>{stats.totalSales || 0} کسٹمر آرڈرز</span>
            <span className="text-emerald-300 group-hover:underline">سیلز ٹریکر ↵</span>
          </div>
        </div>

        {/* Metric 2: Market Udhaar */}
        <div 
          onClick={() => setCurrentTab('sales')}
          className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-800 to-slate-850 border border-rose-500/30 hover:border-rose-400 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">مارکیٹ ادھار</span>
            <Wallet className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl md:text-2xl font-extrabold text-rose-300 font-mono mb-2">
            {formatMoney(stats.totalUdhaar || 0)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-200 pt-3 border-t border-slate-700/60 font-semibold">
            <span>وصولی باقی</span>
            <span className="text-rose-300 group-hover:underline">کھاتہ دیکھیں ↵</span>
          </div>
        </div>

        {/* Metric 3: Stock In Hand */}
        <div 
          onClick={() => setCurrentTab('vault')}
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-800 to-slate-850 border border-indigo-500/30 hover:border-indigo-400 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">اسٹاک والٹ</span>
            <KeyRound className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl md:text-2xl font-extrabold text-white mb-2">
            {stats.inStockCount || 0} <span className="text-sm font-semibold text-slate-300">اکاؤنٹس</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-200 pt-3 border-t border-slate-700/60 font-semibold">
            <span>فوری ڈلیوری تیار</span>
            <span className="text-indigo-300 group-hover:underline">والٹ کھولیں ↵</span>
          </div>
        </div>

        {/* Metric 4: Vendors Directory */}
        <div 
          onClick={() => setCurrentTab('vendors')}
          className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">سپلائرز</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl md:text-2xl font-extrabold text-white mb-2">
            {stats.totalVendors} <span className="text-sm font-semibold text-slate-300">وینڈرز</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-200 pt-3 border-t border-slate-700/60">
            <span className="text-emerald-300 font-bold">{stats.trustedCount} ٹرسٹڈ</span>
            <span>•</span>
            <span className="text-amber-300 font-bold">{stats.untestedCount} نئے</span>
          </div>
        </div>

        {/* Metric 5: Products Catalog */}
        <div 
          onClick={() => setCurrentTab('products')}
          className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">پراڈکٹس</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl md:text-2xl font-extrabold text-white mb-2">
            {stats.totalProducts} <span className="text-sm font-semibold text-slate-300">سروسز</span>
          </div>
          <div className="text-xs text-slate-300 pt-3 border-t border-slate-700/60 font-medium">
            تمام اے آئی، ایڈیٹنگ
          </div>
        </div>
      </div>

      {/* 4. Clean Interactive Switching Tabs */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-md space-y-5">
        {/* Tab Headers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/70">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'purchases'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>میری آخری خریداریاں (Recent Orders)</span>
            </button>

            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'offers'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>مارکیٹ کے لائیو ریٹس (Live Rates)</span>
            </button>
          </div>

          <button
            onClick={() => setCurrentTab(activeTab === 'purchases' ? 'purchases' : 'comparison')}
            className="text-xs text-indigo-300 hover:text-indigo-200 font-bold flex items-center gap-1 hover:underline self-end sm:self-auto"
          >
            <span>مکمل فہرست دیکھیں</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Content: Purchases View */}
        {activeTab === 'purchases' && (
          <div className="space-y-3">
            {dashboardData?.recentPurchases && dashboardData.recentPurchases.length > 0 ? (
              dashboardData.recentPurchases.slice(0, 6).map((p) => {
                const isSuccess = p.result === 'Successful';
                const isFailed = p.result === 'Failed';
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-between gap-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-white text-sm md:text-base">
                          {p.product_name}
                        </span>
                        <span className="text-xs text-slate-300">از</span>
                        <button
                          onClick={() => onOpenVendorDetail(p.vendor_id)}
                          className="text-indigo-300 hover:text-indigo-200 font-bold text-xs md:text-sm hover:underline"
                        >
                          {p.vendor_name}
                        </button>
                      </div>
                      <div className="text-slate-300 text-xs mt-1.5 flex flex-wrap items-center gap-3">
                        <span>تعداد: <strong className="text-white">{p.quantity}</strong></span>
                        <span>•</span>
                        <span>فی یونٹ ریٹ: <strong className="text-emerald-300 font-mono">{formatMoney(p.price)}</strong></span>
                        {p.notes && (
                          <>
                            <span>•</span>
                            <span className="text-slate-300 italic truncate max-w-xs">"{p.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end flex-shrink-0">
                      <div className="text-base md:text-lg font-mono font-extrabold text-white">
                        {formatMoney(p.price * p.quantity)}
                      </div>
                      <span
                        className={`mt-1.5 px-3 py-0.5 rounded-full text-xs font-bold ${
                          isSuccess
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isFailed
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {isSuccess ? 'کامیاب آرڈر' : isFailed ? 'خراب / ریپلیسمنٹ' : p.result}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-300 mb-3 font-medium">ابھی تک کوئی خریداری درج نہیں کی گئی ہے۔</p>
                <button
                  onClick={onOpenAddPurchase}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  پہلی خریداری لاگ کریں
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Offers View */}
        {activeTab === 'offers' && (
          <div className="space-y-3">
            {dashboardData?.recentOffers && dashboardData.recentOffers.length > 0 ? (
              dashboardData.recentOffers.slice(0, 6).map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-between gap-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-white text-sm md:text-base">
                        {o.product_name}
                      </span>
                      <span className="px-2.5 py-0.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold border border-slate-700">
                        {o.duration}
                      </span>
                    </div>
                    <div className="text-slate-300 text-xs mt-1.5 flex flex-wrap items-center gap-3">
                      <span>وینڈر: <strong className="text-white">{o.vendor_name}</strong></span>
                      {o.platform && (
                        <span className="text-indigo-300 font-mono">({o.platform}: {o.identifier})</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-lg md:text-xl font-mono font-extrabold text-emerald-300">
                      {formatMoney(o.price)}
                    </div>
                    <div className="text-xs text-slate-300 mt-1 font-medium">
                      وارنٹی: <span className="text-white font-bold">{o.warranty}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-300 mb-3 font-medium">کوئی ریٹس دستیاب نہیں ہیں۔</p>
                <button
                  onClick={() => setCurrentTab('products')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  پراڈکٹس لسٹ دیکھیں
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
