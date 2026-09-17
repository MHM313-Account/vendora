import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Sparkles, RefreshCw, Send, DollarSign, Percent, ArrowRight, Share2, Layers } from 'lucide-react';

export default function PriceListGeneratorModal({ isOpen, onClose }) {
  const [marginType, setMarginType] = useState('percentage'); // 'percentage' | 'fixed'
  const [marginValue, setMarginValue] = useState(25);
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'PKR'
  const [pkrRate, setPkrRate] = useState(280);
  const [headerText, setHeaderText] = useState("🔥 TODAY'S FRESH DIGITAL ACCOUNTS & RATES 🔥\n⚡ Instant Delivery • Full Replacement Warranty Guaranteed");
  const [footerText, setFooterText] = useState("📩 DM to order now: @YourStoreHandle\n💳 Payment: Binance USDT / JazzCash / Easypaisa / Bank\n🌟 100% Replacement Warranty during valid period!");
  
  const [generatedData, setGeneratedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'table'

  const fetchPriceList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customer-price-list/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marginType,
          marginValue: Number(marginValue),
          currency,
          pkrRate: Number(pkrRate),
          headerText,
          footerText
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedData(data);
      }
    } catch (err) {
      console.error('Error generating price list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPriceList();
    }
  }, [isOpen, marginType, marginValue, currency, pkrRate]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!generatedData?.messageText) return;
    navigator.clipboard.writeText(generatedData.messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    if (!generatedData?.messageText) return;
    const encoded = encodeURIComponent(generatedData.messageText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleTelegramShare = () => {
    if (!generatedData?.messageText) return;
    const encoded = encodeURIComponent(generatedData.messageText);
    window.open(`https://t.me/share/url?url=&text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                کسٹمر ریٹ لسٹ جنریٹر (Auto Broadcast Generator)
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  ری سیلر ٹول
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                اپنے تمام سستے ترین وینڈر ریٹس میں اپنا منافع شامل کر کے واٹس ایپ یا ٹیلی گرام کے لیے فوراً خوبصورت میسج بنائیں
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Controls Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            
            {/* Margin Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                منافع کا طریقہ (Margin Type)
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMarginType('percentage')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    marginType === 'percentage'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>فیصد (%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMarginType('fixed')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    marginType === 'fixed'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>مقررہ منافع ($)</span>
                </button>
              </div>
            </div>

            {/* Margin Value */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  منافع کی رقم ({marginType === 'percentage' ? '%' : '$'})
                </label>
                <span className="text-xs font-bold text-indigo-400">
                  {marginType === 'percentage' ? `+${marginValue}%` : `+$${marginValue}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={marginType === 'percentage' ? 5 : 0.5}
                  max={marginType === 'percentage' ? 100 : 20}
                  step={marginType === 'percentage' ? 5 : 0.5}
                  value={marginValue}
                  onChange={(e) => setMarginValue(e.target.value)}
                  className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  value={marginValue}
                  onChange={(e) => setMarginValue(e.target.value)}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center font-bold text-white"
                />
              </div>
            </div>

            {/* Currency & Exchange Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                کرنسی منتخب کریں (Display Currency)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (روپے)</option>
                </select>

                {currency === 'PKR' ? (
                  <input
                    type="number"
                    placeholder="1 USD = PKR"
                    value={pkrRate}
                    onChange={(e) => setPkrRate(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    title="1 ڈالر کتنے روپے کا ہے"
                  />
                ) : (
                  <div className="flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800/80 text-[11px] text-slate-500">
                    بین الاقوامی ریٹس
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Tab Switcher: Live Message Preview vs Cost & Margin Breakdown */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>واٹس ایپ / ٹیلی گرام میسج پری ویو</span>
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>قیمت و منافع بریک ڈاؤن ٹیبل ({generatedData?.items?.length || 0})</span>
              </button>
            </div>

            <button
              onClick={fetchPriceList}
              disabled={loading}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>ری فریش کریں</span>
            </button>
          </div>

          {/* Tab 1: Live Message Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  readOnly
                  value={generatedData?.messageText || 'لوڈ ہو رہا ہے...'}
                  className="w-full h-80 bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300/90 leading-relaxed focus:outline-none focus:border-indigo-500 select-all"
                />

                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                      copied
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>کاپی ہو گیا!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>میسج کاپی کریں</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="text-xs text-slate-400">
                  💡 میسج کاپی کر کے اپنے واٹس ایپ چینل، براڈکاسٹ یا ٹیلی گرام گروپ میں پوسٹ کریں۔
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-all text-xs font-semibold"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp شیئر</span>
                  </button>
                  <button
                    onClick={handleTelegramShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 border border-sky-500/30 text-sky-400 hover:bg-sky-600/30 transition-all text-xs font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram شیئر</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Profit & Cost Breakdown Table */}
          {activeTab === 'table' && (
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-3">پراڈکٹ</th>
                      <th className="p-3">کیٹیگری</th>
                      <th className="p-3">مدت / وارنٹی</th>
                      <th className="p-3">وینڈر لاگت (Cost)</th>
                      <th className="p-3">گاہک ریٹ (Sell Price)</th>
                      <th className="p-3">خالص منافع (Net Profit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {generatedData?.items?.map((item) => {
                      const costInCurrency = currency === 'PKR' ? Math.round(item.costPrice * pkrRate) : item.costPrice;
                      const profit = Math.round((item.sellingPrice - costInCurrency) * 100) / 100;
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-semibold text-white">{item.name}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">
                            {item.duration || '1 Month'} • {item.warranty || 'Warranty'}
                          </td>
                          <td className="p-3 font-mono text-amber-400">
                            {currency === 'PKR' ? `Rs. ${costInCurrency.toLocaleString()}` : `$${item.costPrice.toFixed(2)}`}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-400">
                            {currency === 'PKR' ? `Rs. ${item.sellingPrice.toLocaleString()}` : `$${item.sellingPrice.toFixed(2)}`}
                          </td>
                          <td className="p-3 font-mono font-extrabold text-indigo-300">
                            +{currency === 'PKR' ? `Rs. ${profit.toLocaleString()}` : `$${profit.toFixed(2)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="text-xs text-slate-400">
            کل پراڈکٹس: <span className="font-bold text-white">{generatedData?.items?.length || 0}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
          >
            بند کریں (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
