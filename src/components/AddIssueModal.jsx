import React, { useState, useEffect } from 'react';
import { X, AlertOctagon } from 'lucide-react';

export default function AddIssueModal({ 
  isOpen, 
  onClose, 
  onIssueSaved, 
  vendors, 
  products,
  preselectedVendorId 
}) {
  const [vendorId, setVendorId] = useState('');
  const [productId, setProductId] = useState('');
  const [title, setTitle] = useState('');
  const [issueType, setIssueType] = useState('Account Expired Early');
  const [financialLoss, setFinancialLoss] = useState('0');
  const [sellerResponse, setSellerResponse] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedVendorId) setVendorId(String(preselectedVendorId));
    else if (vendors.length > 0 && !vendorId) setVendorId(String(vendors[0].id));

    if (products.length > 0 && !productId) setProductId(String(products[0].id));
  }, [preselectedVendorId, vendors, products, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorId || !title.trim()) return alert('وینڈر اور مسئلہ کا عنوان درج کرنا لازمی ہے');

    setSubmitting(true);
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: Number(vendorId),
          product_id: productId ? Number(productId) : null,
          title: title.trim(),
          issue_type: issueType,
          financial_loss: Number(financialLoss) || 0,
          seller_response: sellerResponse,
          notes: notes.trim()
        })
      });

      if (res.ok) {
        onIssueSaved();
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
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <span>نئی شکایت / مالی نقصان لاگ کریں</span>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">متعلقہ پراڈکٹ (اختیاری)</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- کوئی نہیں --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">شکایت کا عنوان *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: اکاؤنٹ 7 دن بعد بند ہو گیا، پاسورڈ چینج ہوا"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Issue Type & Loss */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">نوعیت (Issue Type)</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Account Expired Early">Account Expired Early</option>
                <option value="Invalid Credentials">Invalid Password / Email</option>
                <option value="Wrong Product">Wrong Tier / Product Delivered</option>
                <option value="Payment Scammed">Payment Done, Nothing Delivered</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">مالی نقصان ($ Loss)</label>
              <input
                type="number"
                step="0.01"
                value={financialLoss}
                onChange={(e) => setFinancialLoss(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Seller Response */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">سیلر کا ردعمل (Seller Response)</label>
            <select
              value={sellerResponse}
              onChange={(e) => setSellerResponse(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Pending">Pending (ابھی کوئی جواب نہیں آیا)</option>
              <option value="Replacement Provided">Replacement Provided (نیا اکاؤنٹ دیا)</option>
              <option value="Resolved">Resolved (مسئلہ حل ہو گیا)</option>
              <option value="No Response">No Response (میسج سین کر کے چھوڑ دیا)</option>
              <option value="Blocked">Blocked (ٹیلیگرام یا ڈسکارڈ پر بلاک کر دیا)</option>
              <option value="Refused Refund">Refused Refund (پیسے واپس دینے سے انکار)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">تفصیل / نوٹس</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="سیلر نے کیا کہا، کیا بات چیت ہوئی..."
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
            >
              {submitting ? 'محفوظ...' : 'شکایت محفوظ کریں'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
