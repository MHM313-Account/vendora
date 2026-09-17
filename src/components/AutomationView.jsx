import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Radio, 
  Check, 
  X, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Globe, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  ShieldCheck,
  Inbox
} from 'lucide-react';

export default function AutomationView({ onDataUpdated }) {
  const [sources, setSources] = useState([]);
  const [detectedOffers, setDetectedOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [sourceName, setSourceName] = useState('');
  const [platform, setPlatform] = useState('Telegram');
  const [sourceUrl, setSourceUrl] = useState('');
  const [addingSource, setAddingSource] = useState(false);

  // Test webhook state
  const [testText, setTestText] = useState('🔥 CapCut Pro 1 Month available for $1.60 with 25 days full replacement. Contact @fast_deals_bot');
  const [testSender, setTestSender] = useState('@fast_deals_bot');
  const [simulating, setSimulating] = useState(false);

  const fetchData = async () => {
    try {
      const [srcRes, detRes] = await Promise.all([
        fetch('/api/monitored-sources'),
        fetch('/api/detected-offers?status=Pending')
      ]);
      const [src, det] = await Promise.all([srcRes.json(), detRes.json()]);
      setSources(src);
      setDetectedOffers(det);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (!sourceName.trim() || !sourceUrl.trim()) return;

    setAddingSource(true);
    try {
      await fetch('/api/monitored-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sourceName.trim(),
          platform,
          source_url: sourceUrl.trim()
        })
      });
      setSourceName('');
      setSourceUrl('');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingSource(false);
    }
  };

  const handleDeleteSource = async (id) => {
    if (!window.confirm('کیا آپ اس چینل/ویب سائٹ کی مانیٹرنگ ختم کرنا چاہتے ہیں؟')) return;
    try {
      await fetch(`/api/monitored-sources/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePingSource = async (id) => {
    try {
      await fetch(`/api/sources/ping/${id}`, { method: 'POST' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveDetected = async (id) => {
    try {
      const res = await fetch(`/api/detected-offers/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        fetchData();
        onDataUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissDetected = async (id) => {
    try {
      await fetch(`/api/detected-offers/${id}/dismiss`, { method: 'POST' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateWebhook = async (e) => {
    e.preventDefault();
    if (!testText.trim()) return;

    setSimulating(true);
    try {
      await fetch('/api/webhooks/incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText.trim(),
          sender: testSender.trim(),
          source_name: 'Webhook Simulator'
        })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              آٹومیشن، فیڈز اور اسٹیجنگ کیو (Automation & Feeds)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            ٹیلیگرام چینلز، ڈسکارڈ اور ویب سائٹس کی مانیٹرنگ اور خودکار طریقے سے پکڑی گئی نئی پیشکشیں۔
          </p>
        </div>
      </div>

      {/* Grid: Detected Offers Staging Queue + Add Monitored Source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: Detected Offers (Staging Queue) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">
                  خودکار شناخت شدہ آفرز (Detected Offers Feed)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {detectedOffers.length} زیرِ جائزہ
                </span>
              </div>
              <button
                onClick={fetchData}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                title="ریفریش کریں"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              سسٹم نے سپلائر چینلز سے یہ نئی پوسٹس اور ریٹس پکڑے ہیں۔ براہ کرم ان کا جائزہ لیں اور ایک کلک پر "منظور کریں (Approve)" تاکہ وہ فوری طور پر آپ کے لائیو کمپیریزن ٹیبل میں شامل ہو جائیں۔
            </p>

            {detectedOffers.length === 0 ? (
              <div className="p-10 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">تمام ڈیٹیکٹڈ آفرز پراسیس ہو چکی ہیں!</p>
                <p className="text-xs text-slate-500 mt-1">جیسے ہی کوئی نیا پیغام آئے گا، وہ خودکار طور پر یہاں ظاہر ہو جائے گا۔</p>
              </div>
            ) : (
              <div className="space-y-3">
                {detectedOffers.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{item.vendor_name}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-bold text-indigo-400 text-sm">{item.product_name}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {item.duration}
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-emerald-400 font-mono">
                          ${item.detected_price.toFixed(2)}
                        </div>
                      </div>

                      {/* Snippet */}
                      <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 italic font-mono text-[11px] leading-relaxed">
                        "{item.raw_snippet}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px] text-slate-500">
                      <span>تاریخ: {new Date(item.detected_at).toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDismissDetected(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>مسترد کریں</span>
                        </button>
                        <button
                          onClick={() => handleApproveDetected(item.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-600/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>منظور کر کے ڈیٹا بیس میں ڈالیں ✓</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Webhook Tester Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                ویب ہک اور ٹیلیگرام بوٹ سمیلیٹر (Test Webhook Intake)
              </h4>
            </div>
            <p className="text-xs text-slate-400">
              آپ ٹیلیگرام بوٹ کے ذریعے پیغامات خودکار طور پر سسٹم میں بھیج سکتے ہیں۔ ٹیسٹ کرنے کے لیے میسج بھیج کر دیکھیں:
            </p>

            <form onSubmit={handleSimulateWebhook} className="space-y-2.5">
              <input
                type="text"
                value={testSender}
                onChange={(e) => setTestSender(e.target.value)}
                placeholder="بھیجنے والے کا نام یا بوٹ (@seller_bot)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <textarea
                rows={2}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="ٹیلیگرام میسج کا متن..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
              />
              <button
                type="submit"
                disabled={simulating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>{simulating ? 'میسج جا رہا ہے...' : 'ٹیسٹ میسج بھیجیں (Simulate Intake)'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COL: Monitored Channels & Sources */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="font-bold text-white text-sm">مانیٹر شدہ ذرائع (Live Feeds)</h3>
            </div>

            {/* Add Source Form */}
            <form onSubmit={handleAddSource} className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-300 block">+ نیا ذریعہ مانیٹر کریں</span>
              <input
                type="text"
                required
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="مثلاً: XYZ Official Channel"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="Telegram">Telegram</option>
                  <option value="Website">Website</option>
                  <option value="Discord">Discord</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
                <input
                  type="text"
                  required
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="URL یا لنک"
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <button
                type="submit"
                disabled={addingSource}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                {addingSource ? 'محفوظ...' : '+ شامل کریں'}
              </button>
            </form>

            {/* List of Sources */}
            <div className="space-y-2">
              {sources.map((src) => (
                <div key={src.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-bold text-white">{src.name}</span>
                    </div>
                    <a
                      href={src.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>{src.platform}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePingSource(src.id)}
                      className="p-1 rounded bg-slate-800 text-slate-400 hover:text-emerald-400"
                      title="پنگ چیک کریں"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteSource(src.id)}
                      className="p-1 rounded bg-slate-800 text-slate-400 hover:text-rose-400"
                      title="ڈیلیٹ کریں"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
