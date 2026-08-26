import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import GenerateMedia from '@/components/admin/GenerateMedia';
import { Upload, Loader2, Image as ImageIcon, Trash2, Search, Sparkles, X } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { thumbUrl } from '@/lib/media';

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [showGen, setShowGen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState([]); // {name, status: 'uploading'|'saving'|'done'|'error', msg?}
  const [elapsed, setElapsed] = useState(0);
  const [usageBytes, setUsageBytes] = useState(0);
  const cancelRef = useRef(false);
  const { t } = useLang();

  // Live elapsed timer while uploading — so a stalled upload is obvious.
  useEffect(() => {
    if (!uploading) { setElapsed(0); return; }
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), 500);
    return () => clearInterval(id);
  }, [uploading]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.MediaItem.list('-created_date', 200);
      setItems(data);
      setUsageBytes(data.reduce((a, i) => a + (i.file_size || 0), 0));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    // Only JPG, JPEG, PNG, PDF, MP4 — block anything else up front.
    const ALLOWED = ['jpg', 'jpeg', 'png', 'pdf', 'mp4'];
    const MAX_SIZE = 100 * 1024 * 1024; // 100 MB per file
    const extOf = (name) => (name.split('.').pop() || '').toLowerCase();
    const badFormat = files.filter((f) => !ALLOWED.includes(extOf(f.name)));
    const tooLarge = files.filter((f) => f.size > MAX_SIZE);
    if (badFormat.length || tooLarge.length) {
      const parts = [];
      if (badFormat.length) parts.push(t('admin.format_not_supported'));
      if (tooLarge.length) parts.push(`${tooLarge.length}× ${t('admin.file_too_large')}`);
      alert(parts.join('\n'));
      e.target.value = '';
      return;
    }

    cancelRef.current = false;
    setUploading(true);
    setUploadStatus(files.map((f) => ({ name: f.name, status: 'uploading', size: f.size || 0 })));

    const typeFor = (ext) => (ext === 'mp4' ? 'video' : ext === 'pdf' ? 'pdf' : 'image');

    const uploadOne = async (file, idx) => {
      try {
        if (cancelRef.current) {
          setUploadStatus((prev) => prev.map((s, i) => (i === idx ? { ...s, status: 'error', msg: t('admin.upload_cancelled') } : s)));
          return;
        }
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        if (cancelRef.current) {
          setUploadStatus((prev) => prev.map((s, i) => (i === idx ? { ...s, status: 'error', msg: t('admin.upload_cancelled') } : s)));
          return;
        }
        // Bytes uploaded — now saving the library record (distinct phase).
        setUploadStatus((prev) => prev.map((s, i) => (i === idx ? { ...s, status: 'saving' } : s)));
        const created = await base44.entities.MediaItem.create({
          title: file.name.replace(/\.[^.]+$/, ''),
          type: typeFor(extOf(file.name)),
          url: file_url,
          file_size: file.size || 0,
        });
        setItems((prev) => [created, ...prev]);
        setUsageBytes((u) => u + (file.size || 0));
        setUploadStatus((prev) => prev.map((s, i) => (i === idx ? { ...s, status: 'done' } : s)));
      } catch (err) {
        console.error(`Upload failed for ${file.name}:`, err);
        const msg = err?.message || err?.error || (typeof err === 'string' ? err : 'Błąd');
        setUploadStatus((prev) => prev.map((s, i) => (i === idx ? { ...s, status: 'error', msg } : s)));
      }
    };

    // Limited concurrency — uploading many large files at once overwhelms the
    // upload service and causes silent failures. Process 3 at a time.
    const CONCURRENCY = 3;
    const queue = files.map((f, i) => ({ file: f, idx: i }));
    const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (queue.length) {
        if (cancelRef.current) break;
        const next = queue.shift();
        if (!next) break;
        await uploadOne(next.file, next.idx);
      }
    });
    await Promise.all(workers);

    // Any file the queue never reached counts as cancelled.
    setUploadStatus((prev) => prev.map((s) => (s.status === 'uploading' ? { ...s, status: 'error', msg: t('admin.upload_cancelled') } : s)));
    setUploading(false);
    e.target.value = '';
  };

  const cancelUpload = () => { cancelRef.current = true; };

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
          <p className="text-sm text-neutral-500 mt-1">{items.length} {t('admin.media_count_suffix')} · {(usageBytes / 1048576).toFixed(1)} MB</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">JPG · PNG · PDF · MP4 · max 100 MB</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGen((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition ${showGen ? 'bg-black text-white border-black' : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'}`}
          >
            <Sparkles className="w-4 h-4" /> {t('admin.generate')}
          </button>
          <label className="cursor-pointer">
            <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.mp4" className="hidden" onChange={handleUpload} />
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent,#CBFF00)] text-[var(--accent-ink,#000)] text-sm font-medium rounded-lg hover:opacity-90">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} {t('admin.upload')}
            </span>
          </label>
        </div>
      </div>

      {uploadStatus.length > 0 && (
        <div className="mb-5 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
          {(() => {
            const total = uploadStatus.length;
            const done = uploadStatus.filter((s) => s.status === 'done').length;
            const failed = uploadStatus.filter((s) => s.status === 'error').length;
            const active = uploadStatus.filter((s) => s.status === 'uploading' || s.status === 'saving').length;
            const totalBytes = uploadStatus.reduce((a, s) => a + (s.size || 0), 0);
            const doneBytes = uploadStatus.filter((s) => s.status === 'done').reduce((a, s) => a + (s.size || 0), 0);
            const pct = totalBytes ? Math.round((doneBytes / totalBytes) * 100) : (total ? Math.round((done / total) * 100) : 0);
            const sec = Math.round(elapsed / 1000);
            const mb = (b) => (b / 1048576).toFixed(1);
            const rate = sec > 0 ? doneBytes / 1048576 / sec : 0; // MB/s
            const remainBytes = Math.max(0, totalBytes - doneBytes);
            const eta = rate > 0.01 ? Math.round(remainBytes / 1048576 / rate) : null;
            return (
              <>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="font-medium text-neutral-700">
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin inline -mt-0.5 mr-1.5 text-neutral-500" />
                        {t('admin.uploading_progress') || 'Wgrywanie'}: {done}/{total}
                        {active > 0 && <span className="text-neutral-400"> · {active} aktywnych</span>}
                      </>
                    ) : (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full bg-[var(--accent,#CBFF00)] inline-block text-center text-[8px] leading-[14px] mr-1.5">✓</span>
                        {done}/{total} {t('admin.upload_done_label') || 'gotowe'}
                        {failed > 0 && <span className="text-red-500 ml-2">· {failed} błędów</span>}
                      </>
                    )}
                  </span>
                  <span className="tabular-nums text-neutral-400">{sec}s</span>
                  {uploading && (
                    <button onClick={cancelUpload} className="ml-2 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
                      <X className="w-3.5 h-3.5" /> {t('admin.cancel_upload')}
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between mb-2 text-[11px] text-neutral-500 tabular-nums">
                  <span>{mb(doneBytes)} / {mb(totalBytes)} MB · {pct}%</span>
                  <span>{uploading && rate > 0.01 ? <>{rate.toFixed(1)} MB/s{eta != null ? ` · ~${eta}s` : ''}</> : (totalBytes ? `${mb(totalBytes)} MB` : '')}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${uploading ? 'bg-[var(--accent,#CBFF00)]' : (failed > 0 ? 'bg-red-400' : 'bg-emerald-400')}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="space-y-1">
                  {uploadStatus.map((s, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-white border ${s.status === 'error' ? 'border-red-200' : 'border-neutral-200'}`}>
                      {s.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400 shrink-0" />}
                      {s.status === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent,#CBFF00)] shrink-0" />}
                      {s.status === 'done' && <span className="w-3.5 h-3.5 rounded-full bg-[var(--accent,#CBFF00)] flex items-center justify-center text-[8px] shrink-0">✓</span>}
                      {s.status === 'error' && <span className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white shrink-0">✕</span>}
                      <span className={`truncate flex-1 ${s.status === 'error' ? 'text-red-500' : 'text-neutral-600'}`}>{s.name}</span>
                      {s.size ? <span className="text-[10px] text-neutral-300 shrink-0 tabular-nums">{(s.size/1048576).toFixed(1)} MB</span> : null}
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {s.status === 'uploading' && (t('admin.upload_phase_sending') || 'wysyłanie...')}
                        {s.status === 'saving' && (t('admin.upload_phase_saving') || 'zapis do biblioteki...')}
                        {s.status === 'done' && (t('admin.upload_phase_done') || 'w bibliotece')}
                        {s.status === 'error' && (s.msg || t('admin.upload_failed'))}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
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
                  <img src={thumbUrl(it.url, 300)} alt={it.title} loading="lazy" className="w-full h-full object-cover" />
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