import React, { useState, useEffect } from 'react';
import { X, Bell, Plus, Trash2, Tag, ArrowDownRight, ExternalLink } from 'lucide-react';

export default function PriceAlertsModal({ 
  isOpen, 
  onClose, 
  products,
  onOpenVendorDetail
}) {
  const [alerts, setAlerts] = useState([]);
  const [productId, setProductId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/price-alerts');
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
      if (products.length > 0 && !productId) setProductId(String(products[0].id));
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const handleAddAlert = async (e) => {
    e.preventDefault();
    if (!productId || !targetPrice) return alert('پراڈکٹ اور ٹارگٹ قیمت درج کریں');

    setSubmitting(true);
    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: Number(productId),
          target_price: Number(targetPrice)
        })
      });

      if (res.ok) {
        setTargetPrice('');
        fetchAlerts();
      } else {
        const d = await res.json();
        alert('ایرر: ' + (d.error || 'مسئلہ آیا'));
      }
    } catch (err) {
      alert('سرور ایرر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await fetch(`/api/price-alerts/${id}`, { method: 'DELETE' });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">پرائس ڈراپ الرٹس (Price Alerts)</h2>
              <p className="text-xs text-slate-400">جب کوئی وینڈر آپ کی ٹارگٹ قیمت سے سستا ریٹ دے گا تو فوری الرٹ ملے گا</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Add Alert Form */}
          <form onSubmit={handleAddAlert} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">نیا پرائس الرٹ لگائیں</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">پراڈکٹ منتخب کریں</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">ٹارگٹ قیمت ($ اس سے کم ہو تو بتائیں)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="1.70"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {submitting ? 'محفوظ...' : '+ پرائس الرٹ فعال کریں'}
            </button>
          </form>

          {/* Active Alerts List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">فعال پرائس الرٹس ({alerts.length})</h3>
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 bg-slate-950/30 rounded-xl">کوئی الرٹ فعال نہیں ہے۔</p>
            ) : (
              alerts.map((al) => {
                const hasMatching = al.matching_deals && al.matching_deals.length > 0;
                return (
                  <div key={al.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{al.product_name}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300">
                          ٹارگٹ: &le; ${al.target_price.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteAlert(al.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
                        title="ڈیلیٹ کریں"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Matching Deals */}
                    {hasMatching ? (
                      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 space-y-1.5">
                        <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>سستی ڈیل مل گئی! ({al.matching_deals.length} وینڈرز پیش کر رہے ہیں):</span>
                        </span>
                        {al.matching_deals.map((deal) => (
                          <div key={deal.id} className="flex items-center justify-between text-xs pt-1 border-t border-emerald-900/30">
                            <span className="font-semibold text-white">{deal.vendor_name} ({deal.platform})</span>
                            <span className="font-extrabold text-emerald-400">${deal.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500">ابھی کوئی وینڈر اس ریٹ سے کم پر دستیاب نہیں ہے۔</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
