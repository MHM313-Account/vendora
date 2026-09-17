import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, DollarSign, User, Shield, Package, Calendar, Sparkles, AlertCircle } from 'lucide-react';

export default function AddSaleModal({ isOpen, onClose, onSaleSaved, products, vendors, customers }) {
  const [mode, setMode] = useState('existing'); // 'existing' | 'new_customer'
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // New customer fields
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerContact, setNewCustomerContact] = useState('');
  const [newCustomerPlatform, setNewCustomerPlatform] = useState('WhatsApp');
  
  // Sale details
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [duration, setDuration] = useState('1 Month');
  const [warrantyDays, setWarrantyDays] = useState('25');
  const [credentials, setCredentials] = useState('');
  const [notes, setNotes] = useState('');
  
  // Stock auto-fill
  const [availableStock, setAvailableStock] = useState([]);
  const [selectedStockId, setSelectedStockId] = useState('');

  // Payment & Udhaar details
  const [paymentStatus, setPaymentStatus] = useState('Paid'); // 'Paid' | 'Partial' | 'Pending'
  const [paymentMethod, setPaymentMethod] = useState('JazzCash'); // 'JazzCash' | 'Easypaisa' | 'Bank Transfer' | 'USDT' | 'Cash'
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentProofTrx, setPaymentProofTrx] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When product changes, auto-fetch best vendor and cost
  const handleProductChange = (prodId) => {
    setSelectedProductId(prodId);
    if (!prodId) return;

    fetch(`/api/vendor-product-offer?product_id=${prodId}`)
      .then(res => res.json())
      .then(offer => {
        if (offer) {
          setSelectedVendorId(offer.vendor_id || '');
          const cost = Number(offer.price || 0);
          setCostPrice(cost);
          const suggestedSale = Math.round((cost * 1.30) * 100) / 100;
          setSalePrice(suggestedSale || (cost + 1.50));
          if (offer.duration) setDuration(offer.duration);
          if (offer.warranty) {
            const m = offer.warranty.match(/\d+/);
            if (m) setWarrantyDays(m[0]);
          }
        }
      })
      .catch(() => {});

    // Also fetch available stock for this product
    fetch('/api/stock-inventory')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.stock || []);
        const prodItems = list.filter(it => it.product_id === Number(prodId) && it.status === 'In Stock');
        setAvailableStock(prodItems);
      })
      .catch(() => {});
  };

  // When vendor changes, auto-fetch that vendor's exact rate for this product
  const handleVendorChange = (vId) => {
    setSelectedVendorId(vId);
    if (!selectedProductId || !vId) return;

    fetch(`/api/vendor-product-offer?product_id=${selectedProductId}&vendor_id=${vId}`)
      .then(res => res.json())
      .then(offer => {
        if (offer && offer.price !== undefined) {
          const cost = Number(offer.price || 0);
          setCostPrice(cost);
          const suggestedSale = Math.round((cost * 1.30) * 100) / 100;
          setSalePrice(suggestedSale || (cost + 1.50));
          if (offer.duration) setDuration(offer.duration);
          if (offer.warranty) {
            const m = offer.warranty.match(/\d+/);
            if (m) setWarrantyDays(m[0]);
          }
        }
      })
      .catch(() => {});
  };

  // When stock item is picked, populate credentials and vendor
  const handleStockSelect = (stockId) => {
    setSelectedStockId(stockId);
    const item = availableStock.find(s => s.id === Number(stockId));
    if (item) {
      if (item.credentials) setCredentials(item.credentials);
      if (item.vendor_id) handleVendorChange(item.vendor_id);
      if (item.cost_price) setCostPrice(item.cost_price);
      if (item.duration) setDuration(item.duration);
    }
  };

  const calculatedProfit = (Number(salePrice || 0) - Number(costPrice || 0)).toFixed(2);
  const profitMarginPercent = Number(costPrice) > 0 
    ? Math.round(((Number(salePrice) - Number(costPrice)) / Number(costPrice)) * 100) 
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let cId = selectedCustomerId;
    let cName = '';
    let cContact = '';

    if (mode === 'new_customer') {
      if (!newCustomerName.trim()) {
        setError('کسٹمر کا نام درج کرنا ضروری ہے');
        return;
      }
      try {
        const cRes = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCustomerName.trim(),
            contact: newCustomerContact.trim(),
            platform: newCustomerPlatform
          })
        });
        const cData = await cRes.json();
        cId = cData.id;
        cName = newCustomerName.trim();
        cContact = newCustomerContact.trim();
      } catch (err) {
        setError('کسٹمر محفوظ کرنے میں خرابی ہوئی');
        return;
      }
    } else {
      const existing = customers?.find(c => c.id === Number(selectedCustomerId));
      if (!existing) {
        setError('براہ کرم کسٹمر منتخب کریں');
        return;
      }
      cName = existing.name;
      cContact = existing.contact;
    }

    if (!selectedProductId) {
      setError('براہ کرم پراڈکٹ منتخب کریں');
      return;
    }

    const prod = products?.find(p => p.id === Number(selectedProductId));
    const vend = vendors?.find(v => v.id === Number(selectedVendorId));

    setLoading(true);
    try {
      const res = await fetch('/api/customer-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: cId,
          customer_name: cName,
          customer_contact: cContact,
          product_id: selectedProductId,
          product_name: prod ? prod.name : 'Unknown Product',
          vendor_id: selectedVendorId || null,
          vendor_name: vend ? vend.name : '',
          cost_price: Number(costPrice || 0),
          sale_price: Number(salePrice || 0),
          currency: 'USD',
          duration: duration || '1 Month',
          warranty_days: Number(warrantyDays || 25),
          credentials: credentials.trim(),
          notes: notes.trim(),
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          amount_paid: paymentStatus === 'Paid' ? Number(salePrice || 0) : Number(amountPaid || 0),
          pending_amount: paymentStatus === 'Paid' ? 0 : Math.max(0, Number(salePrice || 0) - Number(amountPaid || 0)),
          payment_proof_trx: paymentProofTrx.trim()
        })
      });

      if (!res.ok) throw new Error('فروخت محفوظ کرنے میں ناکامی');

      // If stock was selected, mark it as sold
      if (selectedStockId) {
        await fetch('/api/stock-inventory/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // could update status if needed
          })
        }).catch(() => {});
      }

      onSaleSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white shadow-lg shadow-emerald-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                نیا کسٹمر آرڈر درج کریں (Log New Sale)
              </h2>
              <p className="text-xs text-slate-400">
                گاہک کی خریداری، وینڈر کی لاگت، اور وارنٹی لنک کو ریکارڈ کریں
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>خریدار / گاہک کی معلومات</span>
              </label>
              <div className="flex gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setMode('existing')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    mode === 'existing'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  موجودہ گاہک
                </button>
                <button
                  type="button"
                  onClick={() => setMode('new_customer')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    mode === 'new_customer'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  + نیا گاہک
                </button>
              </div>
            </div>

            {mode === 'existing' ? (
              <div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- گاہک منتخب کریں --</option>
                  {customers?.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.contact || c.platform})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="گاہک کا نام *"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="نمبر یا یوزر نیم (+92... / @user)"
                    value={newCustomerContact}
                    onChange={(e) => setNewCustomerContact(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <select
                    value={newCustomerPlatform}
                    onChange={(e) => setNewCustomerPlatform(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Direct">Direct / Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Product & Vendor Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                پراڈکٹ منتخب کریں *
              </label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- پراڈکٹ چنیں --</option>
                {products?.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                سپلائر وینڈر (Supplier Vendor)
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => handleVendorChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- وینڈر چنیں --</option>
                {vendors?.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.trust_status})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock inventory shortcut if available */}
          {availableStock.length > 0 && (
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>اسٹاک والٹ سے فوری اکاؤنٹ منتخب کریں ({availableStock.length} دستیاب)</span>
                </span>
              </div>
              <select
                value={selectedStockId}
                onChange={(e) => handleStockSelect(e.target.value)}
                className="w-full bg-slate-900 border border-indigo-500/40 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="">-- والٹ سے اکاؤنٹ چنیں یا نیچے خود درج کریں --</option>
                {availableStock.map(s => (
                  <option key={s.id} value={s.id}>
                    ID #{s.id} — لاگت: ${s.cost_price} — {s.credentials?.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section 3: Cost, Price & Profit Preview */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  وینڈر لاگت (Cost Price $)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-6 pr-3 py-2 text-xs font-mono text-amber-400 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  گاہک فروخت ریٹ (Sale Price $)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-6 pr-3 py-2 text-xs font-mono text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  خالص منافع (Net Profit)
                </label>
                <div className="h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between px-3">
                  <span className={`text-xs font-mono font-bold ${Number(calculatedProfit) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${calculatedProfit}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold">
                    +{profitMarginPercent}%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  پیکیج کی مدت (Duration)
                </label>
                <input
                  type="text"
                  placeholder="مثلاً 1 Month / 1 Year"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  وارنٹی کے دن (Warranty Days)
                </label>
                <input
                  type="number"
                  placeholder="مثلاً 25 دن"
                  value={warrantyDays}
                  onChange={(e) => setWarrantyDays(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Payment & Udhaar Details */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>ادائیگی و کھاتہ (Payment & Udhaar Details)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                ادائیگی کی تصدیق یا ادھار کا ریکارڈ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  ادائیگی کا اسٹیٹس (Payment Status)
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => {
                    const st = e.target.value;
                    setPaymentStatus(st);
                    if (st === 'Paid') setAmountPaid(salePrice);
                    else if (st === 'Pending') setAmountPaid('0');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="Paid">✅ مکمل ادا شدہ (Paid)</option>
                  <option value="Partial">⚠️ جزوی وصولی / ادھار (Partial)</option>
                  <option value="Pending">🔴 مکمل ادھار (Pending / Debt)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  طریقہ ادائیگی (Payment Method)
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="JazzCash">JazzCash (جاز کیش)</option>
                  <option value="Easypaisa">Easypaisa (ایزی پیسہ)</option>
                  <option value="Bank Transfer">Bank Transfer (بینک ٹرانسفر)</option>
                  <option value="USDT">USDT / Crypto</option>
                  <option value="Cash">Cash (کیش نقد)</option>
                  <option value="Other">دیگر (Other)</option>
                </select>
              </div>
            </div>

            {paymentStatus !== 'Paid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    موصول شدہ رقم ($ Received)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-rose-300 mb-1">
                    باقی ادھار رقم ($ Pending Debt)
                  </label>
                  <div className="h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center px-3 font-mono font-bold text-rose-400 text-xs">
                    ${Math.max(0, Number(salePrice || 0) - Number(amountPaid || 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                رسید / ٹرانزیکشن آئی ڈی (Trx ID / Reference)
              </label>
              <input
                type="text"
                placeholder="مثلاً JazzCash TID #938192839 یا USDT TxHash"
                value={paymentProofTrx}
                onChange={(e) => setPaymentProofTrx(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section 5: Credentials & Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ڈیجیٹل اسناد / اکاؤنٹ تفصیلات (Account Credentials)
              </label>
              <input
                type="text"
                placeholder="email:password یا cookie token"
                value={credentials}
                onChange={(e) => setCredentials(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                اگر گاہک وارنٹی کلیم کرے گا تو یہ تفصیلات خود بخود وینڈر کلیم میسج میں شامل ہو جائیں گی
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                اضافی نوٹس (Customer Notes)
              </label>
              <textarea
                rows={2}
                placeholder="ادائیگی کا طریقہ، گاہک کی خصوصی ہدایات وغیرہ..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-4 -mx-6 -mb-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
            >
              منسوخ کریں
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{loading ? 'محفوظ ہو رہا ہے...' : 'آرڈر محفوظ کریں (Save Sale)'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
