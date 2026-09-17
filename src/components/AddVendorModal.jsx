import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShieldCheck, Tag, DollarSign, PackagePlus } from 'lucide-react';

export default function AddVendorModal({ isOpen, onClose, onVendorSaved, initialData, products = [] }) {
  const [name, setName] = useState('');
  const [trustStatus, setTrustStatus] = useState('Untested');
  const [trustScore, setTrustScore] = useState(50);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [platforms, setPlatforms] = useState([
    { platform: 'Telegram', identifier: '', url: '', is_primary: 1 }
  ]);

  // Optional: Immediate Product & Rate attachment
  const [attachOffer, setAttachOffer] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDuration, setOfferDuration] = useState('1 Month');
  const [offerWarranty, setOfferWarranty] = useState('25 Days');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setTrustStatus(initialData.trust_status || 'Untested');
      setTrustScore(initialData.trust_score ?? 50);
      setNotes(initialData.notes || '');
      setTags(initialData.tags || '');
      if (initialData.platforms && initialData.platforms.length > 0) {
        setPlatforms(initialData.platforms);
      } else {
        setPlatforms([{ platform: 'Telegram', identifier: '', url: '', is_primary: 1 }]);
      }
      setAttachOffer(false);
    } else {
      setName('');
      setTrustStatus('Untested');
      setTrustScore(50);
      setNotes('');
      setTags('');
      setPlatforms([{ platform: 'Telegram', identifier: '', url: '', is_primary: 1 }]);
      setAttachOffer(false);
      setSelectedProductId(products.length > 0 ? String(products[0].id) : '');
      setNewProductName('');
      setOfferPrice('');
      setOfferDuration('1 Month');
      setOfferWarranty('25 Days');
    }
  }, [initialData, isOpen, products]);

  if (!isOpen) return null;

  const handlePlatformChange = (index, field, value) => {
    const updated = [...platforms];
    updated[index][field] = value;
    setPlatforms(updated);
  };

  const addPlatformRow = () => {
    setPlatforms([
      ...platforms,
      { platform: 'WhatsApp', identifier: '', url: '', is_primary: 0 }
    ]);
  };

  const removePlatformRow = (index) => {
    if (platforms.length <= 1) return;
    setPlatforms(platforms.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('وینڈر کا نام درج کرنا ضروری ہے');

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      trust_status: trustStatus,
      trust_score: Number(trustScore),
      notes: notes.trim(),
      tags: tags.trim(),
      platforms: platforms.filter(p => p.identifier.trim())
    };

    try {
      const url = initialData ? `/api/vendors/${initialData.id}` : '/api/vendors';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const vendorData = await res.json();
        const vId = initialData ? initialData.id : vendorData.id;

        // If user also entered a product and price, attach it immediately!
        if (attachOffer && offerPrice && vId) {
          let prId = selectedProductId ? Number(selectedProductId) : null;
          if (!prId && newProductName.trim()) {
            const prRes = await fetch('/api/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: newProductName.trim(), category: 'General' })
            });
            const prData = await prRes.json();
            prId = prData.id;
          }

          if (prId) {
            await fetch('/api/offers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                vendor_id: vId,
                product_id: prId,
                price: Number(offerPrice),
                duration: offerDuration,
                warranty: offerWarranty,
                availability: 'Available',
                delivery_method: 'Direct Login'
              })
            });
          }
        }

        onVendorSaved();
        onClose();
      } else {
        const err = await res.json();
        alert('مسئلہ: ' + (err.error || 'کچھ غلط ہو گیا'));
      }
    } catch (err) {
      console.error(err);
      alert('نیٹ ورک یا سرور ایرر');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-xl font-bold text-white">
              {initialData ? 'وینڈر میں ترمیم کریں' : 'نیا وینڈر شامل کریں'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">وینڈر کے رابطے اور اس کی پروڈکٹس کا ریٹ درج کریں</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Vendor Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              وینڈر کا نام (Vendor Name) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: XYZ Store یا FastSub Hub"
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          {/* Trust Status & Score */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ٹرسٹ اسٹیٹس (Trust Status)
              </label>
              <select
                value={trustStatus}
                onChange={(e) => setTrustStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Trusted">🟢 Trusted (قابلِ اعتماد)</option>
                <option value="Untested">🟡 Untested (نیا وینڈر)</option>
                <option value="Risky">🟠 Risky (خطرناک)</option>
                <option value="Scammer">🔴 Scammer (فراڈ / بلیک لسٹ)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                بھروسہ اسکور (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={trustScore}
                onChange={(e) => setTrustScore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Platforms (Telegram, WhatsApp, etc.) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                رابطے کے ذرائع (Platforms / Handles)
              </label>
              <button
                type="button"
                onClick={addPlatformRow}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> دوسرا رابطہ شامل کریں
              </button>
            </div>

            {platforms.map((plat, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <select
                  value={plat.platform}
                  onChange={(e) => handlePlatformChange(idx, 'platform', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="Telegram">Telegram</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Discord">Discord</option>
                  <option value="Website">Website</option>
                  <option value="Email">Email</option>
                </select>
                <input
                  type="text"
                  value={plat.identifier}
                  onChange={(e) => handlePlatformChange(idx, 'identifier', e.target.value)}
                  placeholder="@username یا +92300..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
                {platforms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlatformRow(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ========================================================= */}
          {/* ATTACH INITIAL PRODUCT & RATE (حل: وینڈر اور ریٹ کو جوڑنا) */}
          {/* ========================================================= */}
          {!initialData && (
            <div className="pt-2 border-t border-slate-800/80">
              <div 
                onClick={() => setAttachOffer(!attachOffer)}
                className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 hover:bg-indigo-950/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <PackagePlus className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-200">
                    اس وینڈر کے پاس کیا پراڈکٹ اور کیا ریٹ ہے؟ (ابھی ریٹ جوڑیں)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={attachOffer}
                  onChange={(e) => setAttachOffer(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                />
              </div>

              {attachOffer && (
                <div className="mt-3 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/20 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">پراڈکٹ منتخب کریں:</label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => {
                          setSelectedProductId(e.target.value);
                          if (e.target.value) setNewProductName('');
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="">-- نئی پراڈکٹ لکھیں --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {!selectedProductId && (
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">نئی پراڈکٹ کا نام:</label>
                        <input
                          type="text"
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          placeholder="مثلاً: CapCut Pro, Netflix"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    )}
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
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">نوٹس (Notes)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="وینڈر کیسی سروس دیتا ہے؟ پیمنٹ کا طریقہ کیا ہے؟..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Submit */}
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
            >
              {submitting ? 'محفوظ...' : initialData ? 'تبدیلیاں محفوظ کریں' : 'وینڈر محفوظ کریں ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
