import React, { useState, useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';

export default function AddPurchaseModal({ 
  isOpen, 
  onClose, 
  onPurchaseSaved, 
  vendors, 
  products,
  preselectedData 
}) {
  const [vendorId, setVendorId] = useState('');
  const [productId, setProductId] = useState('');
  const [offerId, setOfferId] = useState(null);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState('Successful');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedData) {
      if (preselectedData.vendor_id) setVendorId(String(preselectedData.vendor_id));
      if (preselectedData.product_id) setProductId(String(preselectedData.product_id));
      if (preselectedData.offer_id) setOfferId(preselectedData.offer_id);
      if (preselectedData.price) setPrice(String(preselectedData.price));
    } else {
      if (vendors.length > 0 && !vendorId) setVendorId(String(vendors[0].id));
      if (products.length > 0 && !productId) setProductId(String(products[0].id));
    }
  }, [preselectedData, vendors, products, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorId || !productId || !price) {
      return alert('وینڈر، پراڈکٹ اور قیمت درج کرنا لازمی ہے');
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: Number(vendorId),
          product_id: Number(productId),
          offer_id: offerId ? Number(offerId) : null,
          price: Number(price),
          quantity: Number(quantity) || 1,
          result,
          notes: notes.trim()
        })
      });

      if (res.ok) {
        onPurchaseSaved();
        onClose();
      } else {
        const data = await res.json();
        alert('ایرر: ' + (data.error || 'کچھ غلط ہوا'));
      }
    } catch (err) {
      alert('سرور ایرر');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <span>خریداری کا اندراج کریں (Log Purchase)</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Vendor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">وینڈر منتخب کریں *</label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.trust_status})
                </option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">پراڈکٹ منتخب کریں *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">فی یونٹ قیمت ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1.80"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">تعداد (Quantity) *</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Result */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">خریداری کا نتیجہ (Result) *</label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Successful">🟢 Successful (اکاؤنٹ درست کام کر رہا ہے)</option>
              <option value="Failed">🔴 Failed (مسئلہ آیا / اکاؤنٹ بند ہو گیا)</option>
              <option value="Replaced">🟡 Replaced (متبادل اکاؤنٹ مل گیا)</option>
              <option value="Refunded">🟠 Refunded (پیسے واپس ملے)</option>
            </select>
          </div>

          {/* Total calculation indicator */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">کل رقم (Total Cost):</span>
            <span className="font-extrabold text-white text-base">
              ${((Number(price) || 0) * (Number(quantity) || 1)).toFixed(2)}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">نوٹس و تجربہ</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: 5 منٹ میں کوڈ دیا، سب درست ہے یا کوئی مسئلہ ہوا..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              منسوخ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              {submitting ? 'محفوظ...' : 'خریداری لاگ کریں'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
