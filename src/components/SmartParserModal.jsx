import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Wand2, 
  Store, 
  PlusCircle, 
  CheckCircle2, 
  Link2, 
  FileText, 
  Send, 
  CheckSquare, 
  Square,
  AlertCircle,
  Loader2,
  Trash2,
  Package
} from 'lucide-react';

export default function SmartParserModal({ isOpen, onClose, onOfferSaved, vendors = [], products = [] }) {
  const [activeTab, setActiveTab] = useState('channel'); // 'channel' or 'paste'

  // Channel link scraper state
  const [channelUrl, setChannelUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  // Bulk paste state
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);

  // Extracted items list
  const [extractedItems, setExtractedItems] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);

  // Target vendor
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [platform, setPlatform] = useState('Telegram');
  const [identifier, setIdentifier] = useState('');

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // 1. Handle Channel Scrape
  const handleScrapeChannel = async (e) => {
    e.preventDefault();
    if (!channelUrl.trim()) return;

    setScraping(true);
    setScrapeError('');
    try {
      const res = await fetch('/api/telegram/scrape-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl: channelUrl.trim() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.items.length === 0) {
          setScrapeError('چینل تو مل گیا لیکن اس کے حالیہ میسجز میں کوئی قیمتوں والی پراڈکٹس نہیں ملیں۔');
        } else {
          setExtractedItems(data.items);
          setSelectedIndices(data.items.map((_, idx) => idx));
          
          // Auto fill vendor name from channel title or username
          const autoName = data.channelTitle || data.channelName + ' Store';
          setVendorName(autoName);
          setPlatform('Telegram');
          setIdentifier('@' + data.channelName);

          // Check if vendor already exists in DB
          const existing = vendors.find(v => 
            v.name.toLowerCase() === autoName.toLowerCase() ||
            (v.platforms && v.platforms.some(p => p.identifier.toLowerCase().includes(data.channelName.toLowerCase())))
          );
          if (existing) {
            setSelectedVendorId(String(existing.id));
          } else {
            setSelectedVendorId('');
          }
        }
      } else {
        setScrapeError(data.error || 'ٹیلیگرام سے ڈیٹا حاصل نہیں ہو سکا۔');
      }
    } catch (err) {
      setScrapeError('نیٹ ورک ایرر: ' + err.message);
    } finally {
      setScraping(false);
    }
  };

  // 2. Handle Bulk Text Parse
  const handleParseText = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setParsing(true);
    setScrapeError('');
    try {
      const res = await fetch('/api/telegram/parse-bulk-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText.trim() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.items.length === 0) {
          setScrapeError('میسج میں سے کوئی پراڈکٹ اور قیمت نہیں مل سکی۔ براہِ کرم چیک کریں کہ میسج میں قیمت ($) درج ہو۔');
        } else {
          setExtractedItems(data.items);
          setSelectedIndices(data.items.map((_, idx) => idx));

          // Detect username in text
          const tgMatch = rawText.match(/@([a-zA-Z0-9_]+)/);
          if (tgMatch) {
            setIdentifier('@' + tgMatch[1]);
            const existing = vendors.find(v => 
              (v.platforms && v.platforms.some(p => p.identifier.toLowerCase().includes(tgMatch[1].toLowerCase()))) ||
              v.name.toLowerCase().includes(tgMatch[1].toLowerCase())
            );
            if (existing) {
              setSelectedVendorId(String(existing.id));
              setVendorName(existing.name);
            } else {
              setVendorName(tgMatch[1] + ' Store');
              setSelectedVendorId('');
            }
          }
        }
      }
    } catch (err) {
      setScrapeError('ایرر: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  // Selection helpers
  const toggleSelectAll = () => {
    if (selectedIndices.length === extractedItems.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(extractedItems.map((_, idx) => idx));
    }
  };

  const toggleItemSelect = (index) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...extractedItems];
    updated[index][field] = value;
    setExtractedItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = extractedItems.filter((_, i) => i !== index);
    setExtractedItems(updated);
    setSelectedIndices(selectedIndices.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  // 3. Save All Selected Items
  const handleSaveAll = async () => {
    const selectedItems = extractedItems.filter((_, idx) => selectedIndices.includes(idx));
    if (selectedItems.length === 0) return alert('کم از کم ایک پراڈکٹ منتخب کرنا لازمی ہے');

    const finalVendorName = selectedVendorId 
      ? vendors.find(v => String(v.id) === selectedVendorId)?.name 
      : vendorName.trim();

    if (!finalVendorName) return alert('وینڈر یا شاپ کا نام درج یا منتخب کریں');

    setSaving(true);
    try {
      const res = await fetch('/api/offers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: selectedVendorId ? Number(selectedVendorId) : null,
          vendor_name: finalVendorName,
          platform,
          identifier,
          items: selectedItems
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        onOfferSaved();
        onClose();
      } else {
        alert('ایرر: ' + (data.error || 'محفوظ نہیں ہو سکا'));
      }
    } catch (err) {
      alert('نیٹ ورک ایرر: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-700/80 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white">
                ٹیلیگرام اسکریپر اور بلک ملٹی پارسر (Telegram Auto-Importer)
              </h2>
              <p className="text-xs text-slate-300">
                چینل کے لنک سے یا لمبے میسج سے تمام پراڈکٹس اور ریٹس 1 سیکنڈ میں نکالیں
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
            <button
              onClick={() => { setActiveTab('channel'); setScrapeError(''); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'channel'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>طریقہ 1: ٹیلیگرام چینل لنک (Auto-Scraper)</span>
            </button>

            <button
              onClick={() => { setActiveTab('paste'); setScrapeError(''); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'paste'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>طریقہ 2: لمبا میسج پیسٹ کریں (Bulk Text)</span>
            </button>
          </div>

          {/* Mode 1: Channel Link Input */}
          {activeTab === 'channel' && (
            <form onSubmit={handleScrapeChannel} className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  پبلک ٹیلیگرام چینل کا لنک یا یوزر نیم درج کریں:
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="مثلاً: t.me/xyz_store یا @xyz_store یا https://t.me/xyz_store"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-400 rounded-xl pl-10 pr-3 py-2.5 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={scraping}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs md:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {scraping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ٹیلیگرام چینل کو اسکین کیا جا رہا ہے...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>چینل سے تمام پراڈکٹس اور ریٹس خودکار کھینچیں 🚀</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 2: Bulk Raw Text Input */}
          {activeTab === 'paste' && (
            <form onSubmit={handleParseText} className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  ٹیلیگرام یا واٹس ایپ کا لمبا پرائس لسٹ میسج یہاں پیسٹ کریں (50+ پروڈکٹس):
                </label>
                <textarea
                  rows={4}
                  required
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`مثال کے طور پر:\n• CapCut Pro 1 Month Private — $1.80 (25 Days)\n• Claude Pro 1 Month: $16.50 (30 Days Warranty)\n• Canva Pro 1 Year — $3.50\n• Netflix 1 Month UHD — $3.20 (28 Days)`}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-purple-400 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={parsing}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs md:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>میسج سے تمام ریٹس نکالے جا رہے ہیں...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>پورے میسج سے تمام پراڈکٹس الگ کریں (Bulk Extract) ⚡</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Error notice */}
          {scrapeError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{scrapeError}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* EXTRACTED ITEMS TABLE REVIEW & SAVE                        */}
          {/* ========================================================= */}
          {extractedItems.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-700/80">
              {/* Vendor Selector & Summary Header */}
              <div className="bg-slate-950/90 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>کامیابی! کل {extractedItems.length} پراڈکٹس اور ریٹس نکال لیے گئے ہیں:</span>
                  </div>
                  <span className="text-xs text-indigo-300 font-bold bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                    {selectedIndices.length} منتخب شدہ
                  </span>
                </div>

                {/* Target Vendor Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" />
                      <span>یہ تمام ریٹس کس وینڈر کے ساتھ اٹیچ کرنے ہیں؟</span>
                    </label>
                    <select
                      value={selectedVendorId}
                      onChange={(e) => {
                        setSelectedVendorId(e.target.value);
                        if (e.target.value) {
                          const v = vendors.find(item => String(item.id) === e.target.value);
                          if (v) setVendorName(v.name);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-400 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="">➕ نیا وینڈر بنائیں (Type New Vendor Name)</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.trust_status || 'Vendor'})</option>
                      ))}
                    </select>
                  </div>

                  {!selectedVendorId && (
                    <div>
                      <label className="block text-[11px] text-slate-300 font-bold mb-1">
                        وینڈر / شاپ کا نام:
                      </label>
                      <input
                        type="text"
                        required
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        placeholder="مثلاً: Ali Store یا Channel Name"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-400 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-2xl border border-slate-700 overflow-hidden bg-slate-950/90 shadow-md">
                <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white"
                  >
                    {selectedIndices.length === extractedItems.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                    <span>تمام منتخب کریں ({extractedItems.length})</span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    ضرورت پڑنے پر آپ نیچے نام یا قیمت تبدیل بھی کر سکتے ہیں
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
                  {extractedItems.map((item, idx) => {
                    const isSelected = selectedIndices.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`p-3 flex items-center gap-3 transition-colors ${
                          isSelected ? 'bg-slate-900/40' : 'bg-slate-950/80 opacity-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItemSelect(idx)}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 flex-shrink-0"
                        />

                        {/* Product Name */}
                        <div className="flex-1 min-w-[140px]">
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-semibold"
                          />
                        </div>

                        {/* Price */}
                        <div className="w-24 flex-shrink-0">
                          <div className="relative">
                            <span className="text-emerald-400 text-xs absolute left-2 top-1/2 -translate-y-1/2 font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-5 pr-2 py-1 text-xs font-mono font-bold text-emerald-300"
                            />
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="w-24 flex-shrink-0 hidden sm:block">
                          <input
                            type="text"
                            value={item.duration}
                            onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300"
                          />
                        </div>

                        {/* Warranty */}
                        <div className="w-24 flex-shrink-0 hidden md:block">
                          <input
                            type="text"
                            value={item.warranty}
                            onChange={(e) => handleItemChange(idx, 'warranty', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300"
                          />
                        </div>

                        {/* Remove Row Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Big Save Button */}
              <button
                type="button"
                disabled={saving || selectedIndices.length === 0}
                onClick={handleSaveAll}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs md:text-sm font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>تمام ریٹس ڈیٹا بیس میں محفوظ کیے جا رہے ہیں...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>یہ تمام ({selectedIndices.length}) پراڈکٹس اور ریٹس 1 کلک میں محفوظ کریں ✓</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
