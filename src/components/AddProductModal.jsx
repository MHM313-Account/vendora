import React, { useState } from 'react';
import { X, Package, Store, DollarSign, PlusCircle } from 'lucide-react';

export default function AddProductModal({ isOpen, onClose, onProductSaved, vendors = [] }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('AI Tools');
  const [description, setDescription] = useState('');
  const [safetyGuidelines, setSafetyGuidelines] = useState('');

  // Optional: Immediate Vendor & Rate attachment
  const [attachVendor, setAttachVendor] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(vendors.length > 0 ? String(vendors[0].id) : '');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDuration, setOfferDuration] = useState('1 Month');
  const [offerWarranty, setOfferWarranty] = useState('25 Days');

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('پراڈکٹ کا نام لکھنا لازمی ہے');

    setSubmitting(true);
    try {
      // 1. Create Product
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          category, 
          description: description.trim(),
          safety_guidelines: safetyGuidelines.trim()
        })
      });

      if (res.ok) {
        const prodData = await res.json();
        const prId = prodData.id;

        // 2. If vendor and price are attached, create Offer immediately!
        if (attachVendor && selectedVendorId && offerPrice && prId) {
          await fetch('/api/offers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vendor_id: Number(selectedVendorId),
              product_id: prId,
              price: Number(offerPrice),
              duration: offerDuration,
              warranty: offerWarranty,
              availability: 'Available',
              delivery_method: 'Direct Login'
            })
          });
        }

        onProductSaved();
        onClose();
      } else {
        const data = await res.json();
        alert('ایرر: ' + (data.error || 'پراڈکٹ پہلے سے موجود ہو سکتی ہے'));
      }
    } catch (err) {
      alert('سرور ایرر');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-6">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>نئی پراڈکٹ شامل کریں</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              پراڈکٹ کا نام *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: CapCut Pro, Claude Pro, Netflix 4K"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">کیٹیگری</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="AI Tools">AI Tools (ChatGPT, Claude, Midjourney)</option>
              <option value="Video Editing">Video Editing (CapCut, Premiere, AfterEffects)</option>
              <option value="Design">Design (Canva, Photoshop, Figma)</option>
              <option value="Streaming">Streaming (Netflix, Spotify, Prime)</option>
              <option value="VPN & Security">VPN & Security</option>
              <option value="Developer Tools">Developer Tools (GitHub, Cursor, Lovable)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1">
              حفاظتی اصول و وارنٹی ہدایات (Safety & Warranty Guidelines)
            </label>
            <textarea
              rows={2}
              value={safetyGuidelines}
              onChange={(e) => setSafetyGuidelines(e.target.value)}
              placeholder="مثلاً: پاس ورڈ تبدیل نہ کریں۔ پروفائل نام نہ بدلیں۔ ایک ڈیوائس پر لاگ ان رکھیں۔ (یہ ہدایات رسید میں شامل ہوں گی)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* ========================================================= */}
          {/* ATTACH VENDOR & RATE (حل: پراڈکٹ اور وینڈر کو جوڑنا)       */}
          {/* ========================================================= */}
          <div className="pt-2 border-t border-slate-800/80">
            <div 
              onClick={() => setAttachVendor(!attachVendor)}
              className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 hover:bg-emerald-950/50 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-200">
                  یہ پراڈکٹ کس وینڈر کے پاس ہے اور کیا ریٹ ہے؟ (ابھی وینڈر جوڑیں)
                </span>
              </div>
              <input
                type="checkbox"
                checked={attachVendor}
                onChange={(e) => setAttachVendor(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded bg-slate-900 border-slate-700"
              />
            </div>

            {attachVendor && (
              <div className="mt-3 p-4 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">وینڈر منتخب کریں:</label>
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.trust_status || 'Vendor'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">قیمت ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="1.80"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-emerald-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">دورانیہ</label>
                    <input
                      type="text"
                      value={offerDuration}
                      onChange={(e) => setOfferDuration(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">وارنٹی</label>
                    <input
                      type="text"
                      value={offerWarranty}
                      onChange={(e) => setOfferWarranty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">تفصیل (Description)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="پراڈکٹ کے بارے میں ضروری نوٹس..."
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
              {submitting ? 'محفوظ...' : 'پراڈکٹ محفوظ کریں ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
