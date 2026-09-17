import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Skull, 
  MessageCircle, 
  Globe, 
  Trash2, 
  Edit3, 
  Tag, 
  CheckCircle2, 
  XCircle,
  Eye,
  DollarSign,
  Package
} from 'lucide-react';

export default function VendorsView({ 
  vendors, 
  onOpenAddVendor, 
  onEditVendor, 
  onDeleteVendor, 
  onOpenVendorDetail,
  onOpenAddOffer
}) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVendors = vendors.filter((v) => {
    const matchesStatus = filterStatus === 'All' || v.trust_status === filterStatus;
    const matchesSearch = 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.tags && v.tags.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.notes && v.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.platforms && v.platforms.some(p => p.identifier.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (v.offers && v.offers.some(o => o.product_name && o.product_name.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesStatus && matchesSearch;
  });

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Telegram':
        return <span className="text-sky-400 font-bold">TG</span>;
      case 'WhatsApp':
        return <span className="text-emerald-400 font-bold">WA</span>;
      case 'Discord':
        return <span className="text-indigo-400 font-bold">DC</span>;
      case 'Website':
        return <Globe className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <MessageCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const statusCounts = {
    All: vendors.length,
    Trusted: vendors.filter(v => v.trust_status === 'Trusted').length,
    Untested: vendors.filter(v => v.trust_status === 'Untested').length,
    Risky: vendors.filter(v => v.trust_status === 'Risky').length,
    Scammer: vendors.filter(v => v.trust_status === 'Scammer').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              وینڈرز کی ڈائرکٹری (Vendors Directory)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            آپ کے تمام سپلائرز، ان کے ریٹس، اور پروڈکٹس کی لسٹ۔
          </p>
        </div>

        <button
          onClick={onOpenAddVendor}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>نیا وینڈر شامل کریں</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'All', label: 'تمام (All)', count: statusCounts.All },
            { id: 'Trusted', label: '🟢 Trusted', count: statusCounts.Trusted },
            { id: 'Untested', label: '🟡 Untested', count: statusCounts.Untested },
            { id: 'Risky', label: '🟠 Risky', count: statusCounts.Risky },
            { id: 'Scammer', label: '🔴 Scammer', count: statusCounts.Scammer },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterStatus === tab.id ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-900 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="وینڈر، پراڈکٹ یا یوزر نیم تلاش کریں..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => {
          const isTrusted = vendor.trust_status === 'Trusted';
          const isScammer = vendor.trust_status === 'Scammer';
          const isRisky = vendor.trust_status === 'Risky';

          return (
            <div
              key={vendor.id}
              className={`rounded-2xl border p-5 bg-slate-900/70 transition-all hover:border-slate-700 flex flex-col justify-between ${
                isScammer
                  ? 'border-rose-900/40'
                  : isTrusted
                  ? 'border-emerald-900/40'
                  : isRisky
                  ? 'border-orange-900/40'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header: Name and Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-white hover:text-indigo-400 cursor-pointer transition-colors"
                        onClick={() => onOpenVendorDetail(vendor.id)}>
                      {vendor.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          isTrusted
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : isScammer
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : isRisky
                            ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {vendor.trust_status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        اسکور: <strong className="text-slate-200">{vendor.trust_score}/100</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditVendor(vendor)}
                      title="ترمیم کریں"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteVendor(vendor.id)}
                      title="ڈیلیٹ کریں"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Trust Score Progress Bar */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      vendor.trust_score >= 80
                        ? 'bg-emerald-500'
                        : vendor.trust_score >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, vendor.trust_score))}%` }}
                  ></div>
                </div>

                {/* Platforms List */}
                <div className="space-y-1.5 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    رابطے کے ذرائع:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {vendor.platforms && vendor.platforms.length > 0 ? (
                      vendor.platforms.map((p) => (
                        <a
                          key={p.id}
                          href={p.url || '#'}
                          target={p.url ? '_blank' : '_self'}
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-[11px] text-slate-300 hover:text-white transition-colors"
                        >
                          {getPlatformIcon(p.platform)}
                          <span className="font-mono truncate max-w-[120px]">{p.identifier}</span>
                          {p.url && <ExternalLink className="w-2.5 h-2.5 text-slate-400" />}
                        </a>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">کوئی رابطہ درج نہیں</span>
                    )}
                  </div>
                </div>

                {/* ========================================================= */}
                {/* ATTACHED PRODUCTS & RATES OF THIS VENDOR                   */}
                {/* ========================================================= */}
                <div className="space-y-1.5 mb-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      <span>دستیاب ریٹس ({vendor.offers?.length || 0}):</span>
                    </span>
                    <button
                      onClick={() => onOpenAddOffer && onOpenAddOffer(vendor.id)}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 hover:underline"
                    >
                      <Plus className="w-3 h-3" /> ریٹ جوڑیں
                    </button>
                  </div>
                  {vendor.offers && vendor.offers.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                      {vendor.offers.map((off) => (
                        <span
                          key={off.id}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 font-medium flex items-center gap-1.5 shadow-sm"
                        >
                          <span>{off.product_name}</span>
                          <strong className="text-emerald-400 font-mono">${off.price.toFixed(2)}</strong>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic pt-0.5">
                      ابھی کوئی ریٹ درج نہیں ہے۔ "ریٹ جوڑیں" پر کلک کریں۔
                    </p>
                  )}
                </div>

                {/* Notes snippet */}
                {vendor.notes && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60 italic mb-3 line-clamp-2">
                    "{vendor.notes}"
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenAddOffer && onOpenAddOffer(vendor.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>نیا ریٹ جوڑیں</span>
                </button>

                <button
                  onClick={() => onOpenVendorDetail(vendor.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>مکمل پروفائل</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
