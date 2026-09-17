import React, { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';

export default function AddReplacementModal({ 
  isOpen, 
  onClose, 
  onReplacementSaved, 
  purchases,
  preselectedPurchaseId 
}) {
  const [purchaseId, setPurchaseId] = useState('');
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedPurchaseId) setPurchaseId(String(preselectedPurchaseId));
    else if (purchases.length > 0 && !purchaseId) setPurchaseId(String(purchases[0].id));
  }, [preselectedPurchaseId, purchases, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purchaseId) return alert('خریداری منتخب کریں');

    setSubmitting(true);
    try {
      const res = await fetch('/api/replacements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchase_id: Number(purchaseId),
          status,
          notes: notes.trim()
        })
      });

      if (res.ok) {
        onReplacementSaved();
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
            <RotateCcw className="w-5 h-5 text-indigo-400" />
            <span>ریپلیسمنٹ کلیم درج کریں (Claim Replacement)</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              متاثرہ خریداری (Affected Purchase) *
            </label>
            <select
              value={purchaseId}
              onChange={(e) => setPurchaseId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {purchases.map(p => (
                <option key={p.id} value={p.id}>
                  {p.vendor_name} — {p.product_name} (${p.price.toFixed(2)}) [{new Date(p.purchase_date).toLocaleDateString()}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">کلیم کی صورتحال (Status)</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Pending">Pending (سیلر کو میسج کر دیا ہے، انتظار ہے)</option>
              <option value="Successful">Successful (سیلر نے نیا اکاؤنٹ دے دیا)</option>
              <option value="Failed">Failed (سیلر نے ریپلیسمنٹ نہیں دی یا بلاک کر دیا)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">تفصیل / نوٹس</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: اکاؤنٹ 5 دن بعد بند ہوا، سیلر کو اسکرین شاٹ بھیج دیا..."
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
              {submitting ? 'محفوظ...' : 'ریپلیسمنٹ محفوظ کریں'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
