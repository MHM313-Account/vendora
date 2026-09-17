import React, { useState } from 'react';
import { Image, Plus, ExternalLink, Trash2, Search, FileText, CheckCircle2 } from 'lucide-react';

export default function EvidenceVaultView({ 
  evidenceList, 
  onOpenAddEvidence, 
  onDeleteEvidence 
}) {
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const filtered = evidenceList.filter((e) => {
    const matchesType = filterType === 'All' || e.evidence_type === filterType;
    const matchesSearch = 
      e.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Image className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              ایویڈینس والٹ (Evidence & Proof Vault)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            وینڈرز کی چیٹس کے اسکرین شاٹس، وارنٹی پالیسی، ادائیگی کی رسیدیں اور لسٹنگ ثبوت محفوظ رکھیں۔
          </p>
        </div>

        <button
          onClick={onOpenAddEvidence}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>نیا ثبوت / اسکرین شاٹ محفوظ کریں</span>
        </button>
      </div>

      {/* Filter Chips & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['All', 'Purchase Proof', 'Chat Screenshot', 'Warranty Proof', 'Complaint', 'Listing Screenshot'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t === 'All' ? 'تمام ثبوت' : t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="تلاش کریں..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Evidence Gallery Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          <p className="text-base font-semibold text-slate-300 mb-1">کوئی ثبوت موجود نہیں</p>
          <p className="text-xs">اوپر بٹن دبا کر نیا اسکرین شاٹ یا چیٹ کا ثبوت اپلوڈ کریں۔</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Image Preview or Placeholder */}
              <div 
                onClick={() => item.image_data && setPreviewImage(item.image_data)}
                className="h-44 bg-slate-950 flex items-center justify-center cursor-pointer relative group overflow-hidden border-b border-slate-800"
              >
                {item.image_data ? (
                  <img
                    src={item.image_data}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-1 text-slate-600" />
                    <span className="text-xs">ٹیکسٹ ریکارڈ / دستاویز</span>
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-indigo-300 border border-slate-700 backdrop-blur-md">
                    {item.evidence_type}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-extrabold text-sm text-white line-clamp-1">{item.title}</h3>
                    <button
                      onClick={() => onDeleteEvidence(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
                      title="ڈیلیٹ کریں"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs text-indigo-400 font-semibold mb-2">
                    وینڈر: {item.vendor_name}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-3 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  {item.source_url && (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>لنک کھولیں</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Image Modal View */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-2">
            <img src={previewImage} alt="Full evidence preview" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
