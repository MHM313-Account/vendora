import React, { useState, useEffect } from 'react';
import { X, Image, Upload, Link2 } from 'lucide-react';

export default function AddEvidenceModal({ 
  isOpen, 
  onClose, 
  onEvidenceSaved, 
  vendors, 
  preselectedVendorId 
}) {
  const [vendorId, setVendorId] = useState('');
  const [evidenceType, setEvidenceType] = useState('Chat Screenshot');
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [imageData, setImageData] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedVendorId) setVendorId(String(preselectedVendorId));
    else if (vendors.length > 0 && !vendorId) setVendorId(String(vendors[0].id));
  }, [preselectedVendorId, vendors, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return alert('تصویر کا سائز 10MB سے کم ہونا چاہیے');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorId || !title.trim()) {
      return alert('وینڈر اور عنوان منتخب کرنا لازمی ہے');
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: Number(vendorId),
          evidence_type: evidenceType,
          title: title.trim(),
          image_data: imageData,
          source_url: sourceUrl.trim(),
          notes: notes.trim()
        })
      });

      if (res.ok) {
        onEvidenceSaved();
        onClose();
      } else {
        const d = await res.json();
        alert('ایرر: ' + (d.error || 'کچھ غلط ہوا'));
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
            <Image className="w-5 h-5 text-indigo-400" />
            <span>نیا ثبوت / اسکرین شاٹ محفوظ کریں</span>
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

          {/* Evidence Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">ثبوت کی نوعیت (Evidence Type) *</label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Chat Screenshot">Chat Screenshot (ٹیلیگرام یا واٹس ایپ چیٹ)</option>
              <option value="Warranty Proof">Warranty Proof (وارنٹی اقرار کا اسکرین شاٹ)</option>
              <option value="Purchase Proof">Purchase Proof (ادائیگی یا ٹرانزیکشن رسید)</option>
              <option value="Complaint">Complaint Proof (اکاؤنٹ ایرر یا بند ہونے کا اسکرین شاٹ)</option>
              <option value="Listing Screenshot">Product Listing (وینڈر کا اصل ریٹ کارڈ)</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">عنوان *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: 25 دن وارنٹی کی تصدیق، بنانس ٹی ایکس آئی ڈی"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Image Upload / Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              اسکرین شاٹ یا تصویر اپلوڈ کریں (اختیاری)
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-4 text-center bg-slate-950/60 cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {imageData ? (
                <div className="space-y-2">
                  <img src={imageData} alt="Uploaded preview" className="h-32 mx-auto rounded-lg object-contain" />
                  <span className="text-xs text-emerald-400 font-semibold block">تصویر منتخب ہو گئی ✓ (تبدیل کرنے کے لیے کلک کریں)</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <span className="text-xs text-slate-300 font-medium block">کلک کر کے تصویر منتخب کریں</span>
                  <span className="text-[10px] text-slate-500 block">PNG, JPG, WebP (زیادہ سے زیادہ 10MB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">میسج یا ویب سائٹ کا لنک (اختیاری)</label>
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://t.me/xyzstore/1234"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">نوٹس</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ثبوت کے بارے میں اہم تفصیل..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              {submitting ? 'محفوظ...' : 'ثبوت محفوظ کریں'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
