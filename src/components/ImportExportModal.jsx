import React, { useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export default function ImportExportModal({ isOpen, onClose, onImportSuccess }) {
  const [csvRows, setCsvRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  // Simple CSV parser for browser
  const parseCSV = (text) => {
    const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      // Regex to handle quoted CSV values properly
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const values = [];
      let match;
      while ((match = regex.exec(lines[i])) !== null && values.length < headers.length) {
        let val = match[1] || '';
        val = val.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
        values.push(val);
      }

      if (values.length > 0) {
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });
        rows.push(rowObj);
      }
    }
    return rows;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const parsed = parseCSV(content);
      setCsvRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    if (csvRows.length === 0) return alert('پہلے CSV فائل منتخب کریں');

    setImporting(true);
    try {
      const res = await fetch('/api/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvRows })
      });

      const data = await res.json();
      if (res.ok) {
        setImportResult(data);
        onImportSuccess();
      } else {
        alert('ایرر: ' + (data.error || 'کچھ غلط ہوا'));
      }
    } catch (err) {
      alert('سرور ایرر');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">ایکسل اور سی ایس وی ڈیٹا امپورٹ / ایکسپورٹ</h2>
              <p className="text-xs text-slate-400">سینکڑوں وینڈرز اور ریٹس ایک ہی کلک پر سسٹم میں ڈالیں یا بیک اپ نکالیں</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Action Row: Download Template & Export */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/api/sample-csv"
              download="Vendora_Sample_Template.csv"
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 transition-all flex items-center gap-3 group"
            >
              <FileText className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-xs font-bold text-white block">سیمپل ایکسل ٹیمپلیٹ ڈاؤنلوڈ</span>
                <span className="text-[10px] text-slate-400">پہلے سے فارمیٹ کی ہوئی CSV فائل</span>
              </div>
            </a>

            <a
              href="/api/export-csv"
              download="Vendora_Full_Export.csv"
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500 transition-all flex items-center gap-3 group"
            >
              <Download className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block">پورا ڈیٹا ایکسپورٹ کریں (Backup)</span>
                <span className="text-[10px] text-slate-400">تمام وینڈرز اور ریٹس اپنے پاس محفوظ کریں</span>
              </div>
            </a>
          </div>

          {/* Upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              اپنا CSV فائل اپلوڈ کریں
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-950/60 cursor-pointer relative transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <span className="text-xs font-semibold text-white block">
                {fileName ? fileName : 'فائل یہاں ڈراپ کریں یا کلک کر کے چنیں'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                صرف .csv فائل فارمیٹ
              </span>
            </div>
          </div>

          {/* Preview of Parsed Rows */}
          {csvRows.length > 0 && !importResult && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>پیشگی جائزہ (Preview): {csvRows.length} ریکارڈز ملے</span>
                <span className="text-emerald-400 text-[11px]">درست فارمیٹ ✓</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 text-[11px] text-slate-300">
                {csvRows.slice(0, 5).map((row, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-white">{row.Vendor || row.vendor}</span>
                    <span className="text-indigo-400">{row.Product || row.product}</span>
                    <span className="font-mono text-emerald-400">${row.Price || row.price}</span>
                  </div>
                ))}
                {csvRows.length > 5 && (
                  <p className="text-[10px] text-slate-500 text-center pt-1">
                    ...اور مزید {csvRows.length - 5} ریکارڈز شامل ہیں۔
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {importResult && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/40 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-300">{importResult.message}</h4>
              <p className="text-xs text-slate-400">سافٹ ویئر کے ڈیٹا بیس میں تمام ریکارڈز شامل ہو چکے ہیں۔</p>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              بند کریں
            </button>
            {csvRows.length > 0 && !importResult && (
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={importing}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
              >
                {importing ? 'امپورٹ ہو رہا ہے...' : `تمام ${csvRows.length} وینڈرز امپورٹ کریں`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
