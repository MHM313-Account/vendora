import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Sparkles, 
  ShieldAlert, 
  Search, 
  Filter, 
  ExternalLink, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  MessageCircle, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GitCommit,
  Receipt,
  BellRing,
  CreditCard,
  Wallet,
  Send,
  RefreshCw
} from 'lucide-react';
import DigitalReceiptModal from './DigitalReceiptModal';
import RenewalAlertsModal from './RenewalAlertsModal';

export default function CustomerSalesView({ 
  onOpenAddSale, 
  onOpenPriceList, 
  onOpenClaimModal,
  onOpenChainModal
}) {
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' | 'customers' | 'udhaar'
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [udhaarData, setUdhaarData] = useState({ totalUdhaar: 0, count: 0, debtors: [] });
  const [expiringCount, setExpiringCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals state
  const [selectedReceiptSaleId, setSelectedReceiptSaleId] = useState(null);
  const [isRenewalsOpen, setIsRenewalsOpen] = useState(false);

  // Credentials visibility toggle per row
  const [visibleCreds, setVisibleCreds] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

  const loadSalesAndCustomers = async () => {
    setLoading(true);
    try {
      const [salesRes, custRes, udhaarRes, renewRes] = await Promise.all([
        fetch('/api/customer-sales'),
        fetch('/api/customers'),
        fetch('/api/customer-sales/udhaar'),
        fetch('/api/customer-sales/renewals?days=3')
      ]);
      const [salesData, custData, udhData, renData] = await Promise.all([
        salesRes.json(),
        custRes.json(),
        udhaarRes.json(),
        renewRes.json()
      ]);
      setSales(Array.isArray(salesData) ? salesData : []);
      setCustomers(Array.isArray(custData) ? custData : []);
      setUdhaarData(udhData || { totalUdhaar: 0, count: 0, debtors: [] });
      setExpiringCount(Array.isArray(renData) ? renData.length : 0);
    } catch (err) {
      console.error('Error loading sales and customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesAndCustomers();
  }, []);

  // Calculate high level KPIs
  const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.sale_price) || 0), 0);
  const totalProfit = sales.reduce((sum, s) => sum + (Number(s.profit) || 0), 0);
  const activeWarranties = sales.filter(s => s.status === 'Active').length;

  const toggleCredVisibility = (id) => {
    setVisibleCreds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCreds = (id, creds) => {
    if (!creds) return;
    navigator.clipboard.writeText(creds);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter sales
  const filteredSales = sales.filter(s => {
    const matchesSearch = 
      (s.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.vendor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customer_contact || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    return (
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.contact || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.platform || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">
              گاہک، سیلز اور خالص منافع (Sales & Profits)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ری سیلر سویٹ
            </span>
          </div>
          <p className="text-xs text-slate-400">
            کسٹمر آرڈرز لاگ، فی آرڈر خالص منافع کی پیمائش، اور وینڈر کے ساتھ 1-کلک وارنٹی کلیم
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsRenewalsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-300 hover:bg-amber-600/30 transition-all text-xs font-bold shadow"
          >
            <BellRing className={`w-4 h-4 text-amber-400 ${expiringCount > 0 ? 'animate-bounce' : ''}`} />
            <span>رینیوول الرٹس</span>
            {expiringCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                {expiringCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenPriceList}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition-all text-xs font-bold shadow"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>ریٹ لسٹ جنریٹر (Price List)</span>
          </button>

          <button
            onClick={onOpenAddSale}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-xs font-bold shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ نیا سیل آرڈر درج کریں</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Net Profit Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900/80 border border-emerald-500/30 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              خالص منافع
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${totalProfit.toFixed(2)}
          </div>
          <p className="text-[10px] text-emerald-300/80 mt-1 font-medium">
            اخراجات منہا کرنے کے بعد
          </p>
        </div>

        {/* Total Revenue Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              کل آمدن
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${totalRevenue.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            گاہکوں سے موصول شدہ
          </p>
        </div>

        {/* Udhaar Debt Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/30 via-slate-900/80 to-slate-900/80 border border-rose-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              مارکیٹ ادھار
            </span>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-300 font-mono">
            ${Number(udhaarData?.totalUdhaar || 0).toFixed(2)}
          </div>
          <p className="text-[10px] text-rose-400/80 mt-1">
            {udhaarData?.count || 0} گاہکوں سے وصولی باقی
          </p>
        </div>

        {/* Total Orders Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              کل آرڈرز
            </span>
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {sales.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {activeWarranties} فعال وارنٹی
          </p>
        </div>

        {/* Total Customers Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              رجسٹرڈ گاہک
            </span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {customers.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            واٹس ایپ / ٹیلی گرام
          </p>
        </div>

      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sales'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>سیلز و آرڈرز لاگ ({sales.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'customers'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>گاہکوں کی فہرست ({customers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('udhaar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'udhaar'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>ادھار کھاتہ (Udhaar Ledger)</span>
            {udhaarData?.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40">
                {udhaarData.count}
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'sales' ? 'گاہک، پراڈکٹ یا وینڈر تلاش کریں...' : 'گاہک کا نام تلاش کریں...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-48 md:w-64"
            />
          </div>

          {activeTab === 'sales' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">تمام اسٹیٹس</option>
              <option value="Active">فعال (Active)</option>
              <option value="Claimed">کلیم جاری (Claimed)</option>
              <option value="Replaced">تبدیل شدہ (Replaced)</option>
              <option value="Expired">وارنٹی ختم (Expired)</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: Sales & Orders Tracker Table */}
      {activeTab === 'sales' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
                <tr>
                  <th className="p-3.5">گاہک (Customer)</th>
                  <th className="p-3.5">پراڈکٹ و مدت</th>
                  <th className="p-3.5">سپلائر وینڈر (Source)</th>
                  <th className="p-3.5">لاگت vs ریٹ</th>
                  <th className="p-3.5">ادائیگی (Payment)</th>
                  <th className="p-3.5">خالص منافع</th>
                  <th className="p-3.5">وارنٹی اسٹیٹس</th>
                  <th className="p-3.5">اسناد (Credentials)</th>
                  <th className="p-3.5 text-right">ایکشن (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      کوئی ریکارڈ نہیں ملا۔ نیا آرڈر درج کرنے کے لیے اوپر دیے گئے بٹن پر کلک کریں۔
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((s) => {
                    const isCredVisible = visibleCreds[s.id];
                    const isCopied = copiedId === s.id;

                    return (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                        
                        {/* Customer */}
                        <td className="p-3.5">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {s.customer_name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                              {s.customer_contact || 'No contact'}
                            </span>
                          </div>
                        </td>

                        {/* Product & Duration */}
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-200">
                            {s.product_name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {s.duration || '1 Month'} • وارنٹی: {s.warranty_days} دن
                          </div>
                        </td>

                        {/* Supplier Vendor Link */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-indigo-400">
                              {s.vendor_name || 'سپلائر منسلک نہیں'}
                            </span>
                          </div>
                          {s.vendor_primary_contact && (
                            <div className="text-[10px] text-slate-400">
                              {s.vendor_primary_platform}: {s.vendor_primary_contact}
                            </div>
                          )}
                        </td>

                        {/* Cost vs Sale Price */}
                        <td className="p-3.5">
                          <div className="font-mono text-emerald-400 font-bold">
                            ${Number(s.sale_price).toFixed(2)}
                          </div>
                          <div className="text-[10px] font-mono text-amber-400">
                            لاگت: ${Number(s.cost_price).toFixed(2)}
                          </div>
                        </td>

                        {/* Payment Status & Udhaar */}
                        <td className="p-3.5">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                              s.payment_status === 'Paid' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                : s.payment_status === 'Partial'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}>
                              {s.payment_status === 'Paid' ? '✅ ادا شدہ' : s.payment_status === 'Partial' ? '⚠️ جزوی ادھار' : '🔴 ادھار'}
                            </span>
                            {Number(s.pending_amount) > 0 && (
                              <span className="text-[10px] font-mono text-rose-400 font-semibold">
                                بقایا: ${Number(s.pending_amount).toFixed(2)}
                              </span>
                            )}
                            {s.payment_method && (
                              <span className="text-[9px] text-slate-400">
                                {s.payment_method}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Net Profit */}
                        <td className="p-3.5">
                          <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                            +${Number(s.profit).toFixed(2)}
                          </div>
                        </td>

                        {/* Warranty Status */}
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                              : s.status === 'Claimed' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : s.status === 'Replaced'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {s.status === 'Active' && <Clock className="w-3 h-3" />}
                            {s.status === 'Claimed' && <AlertTriangle className="w-3 h-3" />}
                            {s.status === 'Replaced' && <CheckCircle2 className="w-3 h-3" />}
                            <span>{s.status}</span>
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {s.sale_date ? s.sale_date.slice(0, 10) : ''}
                          </div>
                        </td>

                        {/* Credentials Preview */}
                        <td className="p-3.5 max-w-[180px]">
                          {s.credentials ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-slate-300 truncate select-all bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                                {isCredVisible ? s.credentials : '••••••••••••'}
                              </span>
                              <button
                                onClick={() => toggleCredVisibility(s.id)}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="اسناد دیکھیں / چھپائیں"
                              >
                                {isCredVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleCopyCreds(s.id, s.credentials)}
                                className="text-slate-400 hover:text-indigo-400 transition-colors"
                                title="کاپی کریں"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[10px]">—</span>
                          )}
                        </td>

                        {/* Action: Receipt, Chain & Claim */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* 1-Click Digital Receipt */}
                            <button
                              onClick={() => setSelectedReceiptSaleId(s.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold transition-all shadow-sm"
                              title="ڈیجیٹل رسید اور وارنٹی انوائس جنریٹ کریں"
                            >
                              <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                              <span>رسید</span>
                            </button>

                            {onOpenChainModal && (
                              <button
                                onClick={() => onOpenChainModal(s.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold transition-all shadow-sm"
                                title="ریپلیسمنٹس کی مکمل چین و ہسٹری دیکھیں"
                              >
                                <GitCommit className="w-3.5 h-3.5 text-purple-400" />
                                <span>چین لاگ</span>
                              </button>
                            )}

                            <button
                              onClick={() => onOpenClaimModal(s.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all shadow-sm"
                              title="وینڈر کے لیے فوری کلیم میسج تیار کریں"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                              <span>کلیم</span>
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
      )}

      {/* TAB 2: Customers Directory */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
              کوئی گاہک نہیں ملا
            </div>
          ) : (
            filteredCustomers.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {c.platform}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {c.contact}
                      </span>
                    </div>
                  </div>

                  {c.platform === 'WhatsApp' && c.contact && (
                    <a
                      href={`https://wa.me/${c.contact.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                      title="WhatsApp چیٹ کھولیں"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}

                  {c.platform === 'Telegram' && c.contact && (
                    <a
                      href={`https://t.me/${c.contact.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-colors"
                      title="Telegram چیٹ کھولیں"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">کل آرڈرز</span>
                    <span className="font-bold text-white">{c.total_orders || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">کل خریداری</span>
                    <span className="font-bold text-emerald-400 font-mono">${Number(c.total_spent || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">خالص منافع</span>
                    <span className="font-bold text-indigo-300 font-mono">+${Number(c.total_profit || 0).toFixed(2)}</span>
                  </div>
                </div>

                {c.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/50">
                    "{c.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Customer Udhaar Ledger (ادھار کھاتہ) */}
      {activeTab === 'udhaar' && (
        <div className="space-y-4">
          
          {/* Udhaar Top Summary Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  گاہک ادھار کھاتہ و واجب الادا بقایا جات (Customer Debt Ledger)
                </h3>
                <p className="text-xs text-slate-400">
                  جن گاہکوں نے جزوی ادائیگی کی یا ابھی تک رقم ادا نہیں کی، ان کی فہرست اور 1-کلک تقاضا
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-rose-500/20">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">کل بقایا رقم</span>
                <span className="text-xl font-black text-rose-400 font-mono">
                  ${Number(udhaarData?.totalUdhaar || 0).toFixed(2)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">مقروض گاہک</span>
                <span className="text-xl font-black text-white">
                  {udhaarData?.count || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Debtors List Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
                  <tr>
                    <th className="p-3.5">گاہک (Customer)</th>
                    <th className="p-3.5">پراڈکٹ و تاریخ</th>
                    <th className="p-3.5">کل بل (Sale Total)</th>
                    <th className="p-3.5">ادا شدہ (Paid)</th>
                    <th className="p-3.5">واجب الادا ادھار (Pending)</th>
                    <th className="p-3.5">طریقہ / حوالہ</th>
                    <th className="p-3.5 text-right">ایکشن (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(!udhaarData?.debtors || udhaarData.debtors.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <span className="font-bold text-white block">ماشاءاللہ! کوئی ادھار باقی نہیں ہے</span>
                        <span className="text-xs text-slate-500">تمام گاہکوں کی ادائیگیاں مکمل کلیئر ہیں۔</span>
                      </td>
                    </tr>
                  ) : (
                    udhaarData.debtors.map((d) => {
                      const isUpdating = updatingPaymentId === d.id;

                      const handleMarkPaidAction = async () => {
                        if (!window.confirm(`کیا آپ واقعی ${d.customer_name} کی بقایا رقم $${d.pending_amount} ادا شدہ قرار دینا چاہتے ہیں؟`)) {
                          return;
                        }
                        setUpdatingPaymentId(d.id);
                        try {
                          const res = await fetch(`/api/customer-sales/${d.id}/payment`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              payment_status: 'Paid',
                              amount_paid: Number(d.sale_price),
                              pending_amount: 0,
                              payment_proof_trx: 'Paid in Full'
                            })
                          });
                          if (res.ok) {
                            await loadSalesAndCustomers();
                          }
                        } catch (err) {
                          console.error('Error marking paid:', err);
                        } finally {
                          setUpdatingPaymentId(null);
                        }
                      };

                      const handleSendWhatsAppReminder = () => {
                        const text = d.whatsappReminderMessage || 
                          `محترم ${d.customer_name} صاحب، سلام! آپ کے اکاؤنٹ ${d.product_name} کی مد میں $${d.pending_amount} واجب الادا ہیں۔ برائے مہربانی جلد ادا فرما دیں۔ شکریہ!`;
                        const phone = (d.customer_contact || '').replace(/\D/g, '');
                        const encoded = encodeURIComponent(text);
                        if (phone) {
                          window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
                        } else {
                          window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
                        }
                      };

                      return (
                        <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{d.customer_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {d.customer_contact || 'No contact'}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-semibold text-slate-200">{d.product_name}</div>
                            <div className="text-[10px] text-slate-500">{d.sale_date?.slice(0, 10)}</div>
                          </td>

                          <td className="p-3.5 font-mono text-slate-300 font-semibold">
                            ${Number(d.sale_price).toFixed(2)}
                          </td>

                          <td className="p-3.5 font-mono text-emerald-400 font-semibold">
                            ${Number(d.amount_paid || 0).toFixed(2)}
                          </td>

                          <td className="p-3.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              ${Number(d.pending_amount).toFixed(2)}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="text-slate-300">{d.payment_method || 'Other'}</div>
                            {d.payment_proof_trx && (
                              <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                                {d.payment_proof_trx}
                              </div>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={handleSendWhatsAppReminder}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all shadow-sm"
                                title="واٹس ایپ پر ادھار کی یاد دہانی بھیجیں"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>تقاضا میسج</span>
                              </button>

                              <button
                                onClick={handleMarkPaidAction}
                                disabled={isUpdating}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
                                title="رقم وصول ہونے پر ادا شدہ مارک کریں"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{isUpdating ? 'اپڈیٹ...' : 'مارک ادا شدہ'}</span>
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
      )}

      {/* Digital Receipt Modal */}
      <DigitalReceiptModal 
        saleId={selectedReceiptSaleId}
        isOpen={Boolean(selectedReceiptSaleId)}
        onClose={() => setSelectedReceiptSaleId(null)}
      />

      {/* Renewal Engine & Expiry Reminder Modal */}
      <RenewalAlertsModal 
        isOpen={isRenewalsOpen}
        onClose={() => setIsRenewalsOpen(false)}
        onDataUpdated={loadSalesAndCustomers}
      />

    </div>
  );
}

