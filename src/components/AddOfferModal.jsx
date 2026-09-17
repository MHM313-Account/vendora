import React, { useState, useEffect } from 'react';
import { X, Tag, DollarSign } from 'lucide-react';

export default function AddOfferModal({ 
  isOpen, 
  onClose, 
  onOfferSaved, 
  vendors, 
  products,
  preselectedVendorId,
  preselectedProductId
}) {
  const [vendorId, setVendorId] = useState('');
  const [productId, setProductId] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [duration, setDuration] = useState('1 Month');
  const [warranty, setWarranty] = useState('25 Days');
  const [availability, setAvailability] = useState('Available');
  const [deliveryMethod, setDeliveryMethod] = useState('Direct Login');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedVendorId) setVendorId(String(preselectedVendorId));
    else if (vendors.length > 0 && !vendorId) setVendorId(String(vendors[0].id));

    if (preselectedProductId) setProductId(String(preselectedProductId));
    else if (products.length > 0 && !productId) setProductId(String(products[0].id));
  }, [preselectedVendorId, preselectedProductId, vendors, products, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorId || !productId || !price) {
      return alert('وینڈر، پراڈکٹ اور قیمت درج کرنا لازمی ہے');
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: Number(vendorId),
          product_id: Number(productId),
          price: Number(price),
          currency,
          duration,
          warranty,
          availability,
          delivery_method: deliveryMethod,
          description: description.trim()
        })
      });

      if (res.ok) {
        onOfferSaved();
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
            <Tag className="w-5 h-5 text-indigo-400" />
            <span>وینڈر کی نئی آفر / قیمت درج کریں</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Vendor selection */}
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

          {/* Product selection */}
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
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">قیمت (Price) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1.80"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">دورانیہ (Duration)</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="1 Month, 1 Year, Lifetime"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Warranty & Availability */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">وارنٹی (Warranty)</label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                placeholder="25 Days, 30 Days Full, No Warranty"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">دستیابی (Availability)</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Available">Available (دستیاب)</option>
                <option value="Out of Stock">Out of Stock (ختم ہے)</option>
                <option value="Failed">Failed (مسئلہ ہے)</option>
              </select>
            </div>
          </div>

          {/* Delivery method */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">ڈیلیوری میتھڈ</label>
            <select
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Direct Login">Direct Login (اکاؤنٹ ای میل پاسورڈ)</option>
              <option value="Automated Key">Automated License Key</option>
              <option value="Team Invite">Team / Workspace Invite</option>
              <option value="Cookie Access">Cookie / Token Access</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">اضافی نوٹس</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً: ریپلیسمنٹ 2 گھنٹے میں، پرائیویٹ ای میل..."
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              {submitting ? 'محفوظ...' : 'آفر محفوظ کریں'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
