import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import GenerateMedia from '@/components/admin/GenerateMedia';
import { Upload, Loader2, Image as ImageIcon, Trash2, Search, Sparkles } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [showGen, setShowGen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState([]); // {name, status: 'uploading'|'done'|'error', msg?}
  const { t } = useLang();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.MediaItem.list('-created_date', 200);
      setItems(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    // HEIC/HEIF are not supported — block them outright with a clear error.
    const blocked = files.some((f) => /\.(heic|heif)$/i.test(f.name) || f.type === 'image/heic' || f.type === 'image/heif');
    if (blocked) {
      alert(t('admin.heic_not_supported'));
      e.target.value = '';
      return;
    }
    setUploading(true);
    setUploadStatus(files.map((f) => ({ name: f.name, status: 'uploading' })));

    const uploadOne = async (file, idx) => {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const ext = uploadFile.name.split('.').pop()?.toLowerCase();
        const type = ['jpg','jpeg','png','webp','gif','svg'].includes(ext) ? 'image'
          : ['mp4','webm','mov'].includes(ext) ? 'video'
          : ['pdf'].includes(ext) ? 'pdf' : 'document';
        const created = await base44.entities.MediaItem.create({ title: uploadFile.name.replace(/\.[^.]+$/, ''), type, url: file_url });
        setItems((prev) => [created, ...prev]);
        setUploadStatus((prev) => prev.map((s, i) => (i === idx ? { ...s, status: 'done' } : s)));
      } catch (err) {
        console.error(`Upload failed for ${file.name}:`, err);
        const msg = err?.message || err?.error || (typeof err === 'string' ? err : 'Błąd');
        setUploadStatus((prev) => prev.map((s, i) => (i === idx ? { ...s, status: 'error', msg } : s)));
      }
    };

    // Limited concurrency — uploading 10+ large iPhone photos at once overwhelms
    // the upload service and causes silent failures. Process 3 at a time.
    const CONCURRENCY = 3;
    const queue = files.map((f, i) => ({ file: f, idx: i }));
    const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (queue.length) {
        const next = queue.shift();
        if (!next) break;
        await uploadOne(next.file, next.idx);
      }
    });
    await Promise.all(workers);

    setUploading(false);
    e.target.value = '';
  };

  const remove = async (id) => {
    if (!confirm(t('admin.confirm_remove_media'))) return;
    await base44.entities.MediaItem.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => !search || i.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('admin.media_library')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{items.length} {t('admin.media_count_suffix')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGen((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition ${showGen ? 'bg-black text-white border-black' : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'}`}
          >
            <Sparkles className="w-4 h-4" /> {t('admin.generate')}
          </button>
          <label className="cursor-pointer">
            <input type="file" multiple accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg,video/*,application/pdf" className="hidden" onChange={handleUpload} />
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#CBFF00] text-black text-sm font-medium rounded-lg hover:opacity-90">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} {t('admin.upload')}
            </span>
          </label>
        </div>
      </div>

      {uploadStatus.length > 0 && (
        <div className="mb-5 space-y-1.5">
          {uploadStatus.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200">
              {s.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400 shrink-0" />}
              {s.status === 'done' && <span className="w-3.5 h-3.5 rounded-full bg-[#CBFF00] flex items-center justify-center text-[8px] shrink-0">✓</span>}
              {s.status === 'error' && <span className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white shrink-0">✕</span>}
              <span className={`truncate flex-1 ${s.status === 'error' ? 'text-red-500' : 'text-neutral-600'}`}>{s.name}</span>
              {s.status === 'error' && <span className="text-red-400 text-[10px] truncate max-w-[40%]">{s.msg || t('admin.upload_failed')}</span>}
            </div>
          ))}
        </div>
      )}

      {showGen && (
        <div className="mb-6 max-w-md border border-neutral-200 rounded-2xl p-4 bg-neutral-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-neutral-500" />
            <h2 className="text-sm font-semibold">{t('admin.ai_media_gen')}</h2>
          </div>
          <GenerateMedia onSaved={(created) => setItems((prev) => [created, ...prev])} />
        </div>
      )}

      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input className="pl-9" placeholder={t('admin.search_media')} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-400 border border-dashed rounded-2xl">
          <ImageIcon className="w-10 h-10 mb-3" />
          <p className="text-sm">{t('admin.no_media')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((it) => (
            <div key={it.id} className="group relative bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="aspect-square">
                {it.type === 'image' ? (
                  <img src={it.url} alt={it.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-50 flex flex-col items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-neutral-300 mb-1" />
                    <span className="text-[10px] text-neutral-400 uppercase">{it.type}</span>
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{it.title}</p>
              </div>
              <button onClick={() => remove(it.id)} className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-red-500 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}