import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Scale, 
  ShoppingCart, 
  RotateCcw,
  AlertOctagon,
  Image,
  BarChart3,
  Zap,
  Settings,
  ShieldCheck,
  TrendingUp,
  KeyRound,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, onOpenSettings, onOpenPriceList }) {
  const sections = [
    {
      title: 'بنیادی کنٹرول (Overview)',
      items: [
        { id: 'dashboard', label: 'Dashboard', sub: 'مرکزی ڈیش بورڈ', icon: LayoutDashboard },
        { id: 'comparison', label: 'Rate Comparison', sub: 'سپلائر ریٹس کا موازنہ', icon: Scale, highlight: true },
        { id: 'analytics', label: 'Analytics & Costs', sub: 'موثر لاگت و کارکردگی', icon: BarChart3 },
      ]
    },
    {
      title: 'ری سیلر و منافع (Reseller Suite)',
      items: [
        { id: 'sales', label: 'Sales & Net Profit', sub: 'گاہک، آرڈرز اور خالص منافع', icon: TrendingUp, highlight: true },
        { id: 'vault', label: 'Digital Stock Vault', sub: 'اکاؤنٹس و اسناد والٹ', icon: KeyRound },
      ]
    },
    {
      title: 'وینڈرز و آرڈرز (Operations)',
      items: [
        { id: 'vendors', label: 'Vendors Directory', sub: 'تمام وینڈرز اور پروفائلز', icon: Users },
        { id: 'products', label: 'Products Catalog', sub: 'پراڈکٹس لسٹ اور ویریئنٹس', icon: Package },
        { id: 'purchases', label: 'Purchase History', sub: 'خریداریوں کا مکمل لاگ', icon: ShoppingCart },
        { id: 'replacements', label: 'Warranty Tracker', sub: 'وارنٹی اور ریپلیسمنٹ', icon: RotateCcw },
      ]
    },
    {
      title: 'تحفظ و ٹولز (Protection & Tools)',
      items: [
        { id: 'issues', label: 'Issues & Losses', sub: 'شکایات اور نقصانات ($)', icon: AlertOctagon },
        { id: 'evidence', label: 'Evidence Vault', sub: 'اسکرین شاٹس اور تصویری ثبوت', icon: Image },
        { id: 'automation', label: 'Channel Feeds', sub: 'مانیٹرنگ اور ڈیٹیکشن', icon: Zap },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-extrabold text-xl tracking-wider">
          V
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base text-white tracking-tight">Vendora</h1>
            <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
              Pro
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Supplier Intelligence</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {sections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {sec.title}
            </div>

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  } ${item.highlight && !isActive ? 'border border-indigo-500/20 bg-indigo-950/20 text-indigo-200' : ''}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <div className="flex-1 truncate">
                    <div className="text-xs leading-tight flex items-center justify-between">
                      <span className="font-medium">{item.label}</span>
                      {item.highlight && !isActive && (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
                          Main
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {item.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Quick Price List Button & Settings */}
      <div className="p-3 border-t border-slate-800/60 space-y-1">
        {onOpenPriceList && (
          <button
            onClick={onOpenPriceList}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600/15 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-600/25 hover:text-white transition-all text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>ریٹ لسٹ جنریٹر (Price List)</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs font-semibold"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>سیٹنگز اور بیک اپ (Backups)</span>
        </button>
      </div>

      {/* Local System Status Box */}
      <div className="p-3 m-3 mt-0 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-400">100% لوکل ڈیٹا بیس</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          تمام ریکارڈز آپ کے کمپیوٹر میں محفوظ ہیں۔
        </p>
      </div>
    </aside>
  );
}
