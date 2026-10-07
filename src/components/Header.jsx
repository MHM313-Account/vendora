import React from 'react';
import { Search, UserPlus, ShoppingBag, Bell, FileSpreadsheet, Sparkles, Menu } from 'lucide-react';

export default function Header({ 
  globalSearch, 
  setGlobalSearch, 
  onSearchSubmit,
  onOpenAddVendor,
  onOpenAddPurchase,
  onOpenAddProduct,
  onOpenImportExport,
  onOpenPriceAlerts,
  onOpenSmartParser,
  onOpenPriceList,
  onOpenMobileMenu,
  activeAlertsCount
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/80 px-3 md:px-6 flex items-center justify-between gap-2 md:gap-4 sticky top-0 z-30 shadow-sm">
      {/* Mobile Menu Hamburger */}
      <button
        onClick={onOpenMobileMenu}
        className="p-2 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 md:hidden flex-shrink-0 transition-colors"
        title="مینو کھولیں"
      >
        <Menu className="w-5 h-5 text-indigo-400" />
      </button>

      {/* Global Quick Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-300 absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="سرچ: CapCut, Claude, یا وینڈر..."
          className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-400 rounded-xl pl-9 md:pl-10 pr-14 md:pr-20 py-1.5 md:py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
        />
        <button
          onClick={onSearchSubmit}
          className="absolute right-1 md:right-1.5 top-1/2 -translate-y-1/2 px-2 py-0.5 md:px-2.5 md:py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[10px] md:text-[11px] font-bold border border-slate-600 transition-colors"
        >
          ↵
        </button>
      </div>

      {/* Mobile Quick Action Buttons */}
      <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onOpenAddPurchase}
          className="p-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40"
          title="خریداری درج کریں"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenAddVendor}
          className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
          title="نیا وینڈر شامل کریں"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop Action Tools & Quick Buttons */}
      <div className="hidden md:flex items-center gap-2">
        {/* Price List Generator */}
        {onOpenPriceList && (
          <button
            onClick={onOpenPriceList}
            title="کسٹمر براڈکاسٹ ریٹ لسٹ جنریٹر"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">ریٹ لسٹ</span>
          </button>
        )}

        {/* Smart Parser */}
        <button
          onClick={onOpenSmartParser}
          title="میسج سے خودکار ڈیٹا نکالیں"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span className="hidden sm:inline">اسمارٹ پارسر</span>
        </button>

        {/* Price Alerts */}
        <button
          onClick={onOpenPriceAlerts}
          title="پرائس الرٹس"
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600/20 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/40 transition-all shadow-sm"
        >
          <Bell className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">الرٹس</span>
          {activeAlertsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5"></span>
          )}
        </button>

        {/* CSV Import/Export */}
        <button
          onClick={onOpenImportExport}
          title="ایکسل اور CSV امپورٹ/ایکسپورٹ"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">ایکسل / CSV</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-700 mx-1"></div>

        {/* Log Purchase */}
        <button
          onClick={onOpenAddPurchase}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-all shadow-sm"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span className="hidden md:inline">خریداری لاگ</span>
        </button>

        {/* Add Vendor */}
        <button
          onClick={onOpenAddVendor}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>نیا وینڈر</span>
        </button>
      </div>
    </header>
  );
}
