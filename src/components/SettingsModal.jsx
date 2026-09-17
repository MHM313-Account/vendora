import React, { useState, useEffect } from 'react';
import { X, Settings, Database, HardDrive, CheckCircle2, ShieldCheck, Download, RefreshCw, Copy, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [backups, setBackups] = useState([]);
  const [backingUp, setBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/backups');
      const data = await res.json();
      setBackups(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) fetchBackups();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateBackup = async () => {
    setBackingUp(true);
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const data = await res.json();
      setBackupMessage(data.message || 'بیک اپ تیار ہو گیا!');
      fetchBackups();
    } catch (err) {
      alert('بیک اپ بنانے میں مسئلہ آیا');
    } finally {
      setBackingUp(false);
    }
  };

  const webhookUrl = `${window.location.origin}/api/webhooks/incoming`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">سسٹم سیٹنگز و ڈیٹا بیس بیک اپ</h2>
              <p className="text-xs text-slate-400">لوکل ڈیٹا بیس اسنیپ شاٹس اور آٹومیشن سیٹ اپ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Backup Section */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">1-Click لوکل ڈیٹا بیس بیک اپ</h3>
              </div>
              <button
                onClick={handleCreateBackup}
                disabled={backingUp}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                {backingUp ? 'بیک اپ بن رہا ہے...' : 'نیا بیک اپ بنائیں 💾'}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              یہ بٹن دبانے سے آپ کی مکمل ڈیٹا بیس فائل (`vendora.db`) کی ایک تاریخ وار کاپی آپ کے لیپ ٹاپ کے `backups/` فولڈر میں محفوظ ہو جائے گی۔
            </p>

            {backupMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{backupMessage}</span>
              </div>
            )}

            {/* Backups List */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                موجودہ بیک اپس ({backups.length}):
              </span>
              {backups.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">ابھی کوئی بیک اپ فائل موجود نہیں ہے۔</p>
              ) : (
                backups.map((b, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-200">{b.fileName}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {(b.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Webhook Configuration URL */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">ان کمنگ ویب ہک یو آر ایل (Webhook URL)</h3>
            </div>
            <p className="text-xs text-slate-400">
              اگر آپ کوئی ٹیلیگرام بوٹ یا اسکرپٹ چلائیں تو وہ اس لوکل ایڈریس پر نئی آفرز بھیج سکتی ہے:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
              />
              <button
                onClick={copyWebhook}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'کاپی ہو گیا' : 'کاپی'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
