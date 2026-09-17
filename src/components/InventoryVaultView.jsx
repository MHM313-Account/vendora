import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Package, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Search, 
  DollarSign, 
  RefreshCw,
  Archive,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export default function InventoryVaultView({ products, vendors }) {
  const [stockItems, setStockItems] = useState([]);
  const [lowStockData, setLowStockData] = useState({ count: 0, lowStockProducts: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [productFilter, setProductFilter] = useState('All');

  // Bulk add modal state
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkProductId, setBulkProductId] = useState('');
  const [bulkVendorId, setBulkVendorId] = useState('');
  const [bulkCostPrice, setBulkCostPrice] = useState('1.80');
  const [bulkDuration, setBulkDuration] = useState('1 Month');
  const [bulkText, setBulkText] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Credentials reveal state & copy feedback
  const [visibleCreds, setVisibleCreds] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const loadStock = async () => {
    setLoading(true);
    try {
      const [stockRes, lowRes] = await Promise.all([
        fetch('/api/stock-inventory'),
        fetch('/api/stock-inventory/low-stock')
      ]);
      const [stockData, lowData] = await Promise.all([
        stockRes.json(),
        lowRes.json()
      ]);
      setStockItems(Array.isArray(stockData) ? stockData : []);
      setLowStockData(lowData || { count: 0, lowStockProducts: [] });
    } catch (err) {
      console.error('Error loading stock inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const toggleCredVisibility = (id) => {
    setVisibleCreds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('کیا آپ یہ اکاؤنٹ والٹ سے حذف کرنا چاہتے ہیں؟')) return;
    try {
      await fetch(`/api/stock-inventory/${id}`, { method: 'DELETE' });
      loadStock();
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk submit handler
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkProductId) {
      alert('براہ کرم پراڈکٹ منتخب کریں');
      return;
    }
    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      alert('کم از کم ایک اکاؤنٹ یا اسناد درج کریں');
      return;
    }

    const prod = products?.find(p => p.id === Number(bulkProductId));
    const items = lines.map(line => ({
      product_id: Number(bulkProductId),
      product_name: prod ? prod.name : 'Digital Product',
      vendor_id: bulkVendorId ? Number(bulkVendorId) : null,
      credentials: line,
      duration: bulkDuration,
      cost_price: Number(bulkCostPrice || 0),
      status: 'In Stock'
    }));

    setBulkSubmitting(true);
    try {
      const res = await fetch('/api/stock-inventory/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        setIsBulkOpen(false);
        setBulkText('');
        loadStock();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBulkSubmitting(false);
    }
  };

  // KPIs
  const inStockCount = stockItems.filter(s => s.status === 'In Stock').length;
  const soldCount = stockItems.filter(s => s.status === 'Sold').length;
  const totalStockValue = stockItems
    .filter(s => s.status === 'In Stock')
    .reduce((sum, s) => sum + (Number(s.cost_price) || 0), 0);

  // Filters
  const filteredStock = stockItems.filter(item => {
    const matchesSearch = 
      (item.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.vendor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.credentials || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesProduct = productFilter === 'All' || item.product_id === Number(productFilter);

    return matchesSearch && matchesStatus && matchesProduct;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">
              ڈیجیٹل اسٹاک اور اسناد والٹ (Digital Stock Vault)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              سیکور والٹ
            </span>
          </div>
          <p className="text-xs text-slate-400">
            خریدے گئے اکاؤنٹس کی اسناد (email:password یا session cookies) محفوظ رکھیں اور آرڈر پر فوری ڈیلیور کریں
          </p>
        </div>

        <button
          onClick={() => setIsBulkOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-xs font-bold shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>+ نیا اسٹاک شامل کریں (Bulk Import)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* In Stock Count */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900/80 border border-emerald-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              دستیاب اکاؤنٹس (In Stock)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {inStockCount}
          </div>
          <p className="text-[10px] text-emerald-300/80 mt-1">
            فوری ڈلیوری کے لیے تیار
          </p>
        </div>

        {/* Sold Count */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              فروخت شدہ اکاؤنٹس (Sold)
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {soldCount}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            گاہکوں کو ڈلیور ہو چکے
          </p>
        </div>

        {/* Stock Value */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              اسٹاک سرمایہ لاگت (Total Value)
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${totalStockValue.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            موجودہ اسٹاک کی وینڈر قیمت
          </p>
        </div>

      </div>

      {/* Low Stock & Reorder Opportunities Warning */}
      {lowStockData?.lowStockProducts?.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              </div>
              <h3 className="text-sm font-bold text-white">
                کم اسٹاک وارننگ و سستا ری اسٹاک (Low Stock & Quick Reorder)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              {lowStockData.count} پراڈکٹس کم ہیں
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {lowStockData.lowStockProducts.map(p => (
              <div key={p.product_id} className="p-3 rounded-xl bg-slate-950/70 border border-rose-500/20 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{p.product_name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${p.in_stock_count === 0 ? 'bg-rose-500/30 text-rose-300' : 'bg-amber-500/30 text-amber-300'}`}>
                    {p.in_stock_count === 0 ? 'اسٹاک 0 (ختم)' : 'صرف 1 باقی'}
                  </span>
                </div>

                {p.cheapest_offer ? (
                  <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400">سستا وینڈر: </span>
                      <span className="text-indigo-300 font-semibold">{p.cheapest_offer.vendor_name}</span>
                      <span className="font-mono text-emerald-400 font-bold ml-1.5">${Number(p.cheapest_offer.price).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => {
                        setBulkProductId(String(p.product_id));
                        if (p.cheapest_offer.vendor_id) setBulkVendorId(String(p.cheapest_offer.vendor_id));
                        if (p.cheapest_offer.price) setBulkCostPrice(String(p.cheapest_offer.price));
                        setIsBulkOpen(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition-all shadow-sm"
                    >
                      + ری اسٹاک
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800">
                    کوئی فعال پیشکش درج نہیں ہے
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="پراڈکٹ، وینڈر یا اسناد تلاش کریں..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">تمام اسٹیٹس</option>
            <option value="In Stock">دستیاب (In Stock)</option>
            <option value="Sold">فروخت شدہ (Sold)</option>
            <option value="Reserved">محفوظ (Reserved)</option>
          </select>

          {/* Product Filter */}
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">تمام پراڈکٹس</option>
            {products?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={loadStock}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="ریفریش کریں"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="p-3.5">پراڈکٹ</th>
                <th className="p-3.5">سپلائر وینڈر</th>
                <th className="p-3.5">لاگت (Cost)</th>
                <th className="p-3.5">اسٹیٹس</th>
                <th className="p-3.5">اکاؤنٹ اسناد (Credentials / Token)</th>
                <th className="p-3.5">تاریخ اندراج</th>
                <th className="p-3.5 text-right">ایکشن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStock.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    کوئی اسٹاک ریکارڈ نہیں ملا۔ اوپر دیے گئے بٹن سے بلک اسناد شامل کریں۔
                  </td>
                </tr>
              ) : (
                filteredStock.map((item) => {
                  const isVisible = visibleCreds[item.id];
                  const isCopied = copiedId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-white">
                        {item.product_name}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {item.duration || '1 Month'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="text-indigo-400 font-semibold">
                          {item.vendor_name || '—'}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-amber-400 font-semibold">
                        ${Number(item.cost_price || 0).toFixed(2)}
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'In Stock'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'In Stock' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                          <span>{item.status}</span>
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2 max-w-xs">
                          <code className="px-2.5 py-1 rounded bg-slate-950 text-emerald-300 font-mono text-[11px] truncate select-all border border-slate-800">
                            {isVisible ? item.credentials : '••••••••••••••••••••'}
                          </code>
                          <button
                            onClick={() => toggleCredVisibility(item.id)}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="دیکھیں / چھپائیں"
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopy(item.id, item.credentials)}
                            className="text-slate-400 hover:text-indigo-400 transition-colors"
                            title="کاپی کریں"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {item.created_at ? item.created_at.slice(0, 10) : '—'}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="حذف کریں"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Bulk Stock Import Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    بلک اسٹاک اسناد شامل کریں (Bulk Import Stock)
                  </h3>
                  <p className="text-xs text-slate-400">
                    ایک ساتھ متعدد اکاؤنٹس لائن بہ لائن چسپاں کریں
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    پراڈکٹ منتخب کریں *
                  </label>
                  <select
                    required
                    value={bulkProductId}
                    onChange={(e) => setBulkProductId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- منتخب کریں --</option>
                    {products?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    سپلائر وینڈر
                  </label>
                  <select
                    value={bulkVendorId}
                    onChange={(e) => setBulkVendorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- منتخب کریں --</option>
                    {vendors?.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    فی اکاؤنٹ لاگت (Cost Price $)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={bulkCostPrice}
                    onChange={(e) => setBulkCostPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    پیکیج مدت (Duration)
                  </label>
                  <input
                    type="text"
                    value={bulkDuration}
                    onChange={(e) => setBulkDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اکاؤنٹ اسناد (ہر لائن پر ایک اکاؤنٹ):
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder={`user1@gmail.com:pass123\nuser2@gmail.com:pass456\nsession_cookie_token_xyz`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-300 leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={bulkSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  {bulkSubmitting ? 'شامل ہو رہا ہے...' : 'والٹ میں محفوظ کریں'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
