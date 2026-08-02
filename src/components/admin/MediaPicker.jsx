import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import GenerateMedia from '@/components/admin/GenerateMedia';
import { Image as ImageIcon, Upload, Link2, Loader2, Check, Sparkles } from 'lucide-react';

// Reusable media picker: browse MediaItem library or upload a new file.
// onPick(url, mediaItem?) => called when user selects.
export default function MediaPicker({ open, onClose, onPick, allowMultiple = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(allowMultiple ? [] : null);
  const [externalUrl, setExternalUrl] = useState('');
  const [tab, setTab] = useState('library');

  // Reset selection whenever the dialog opens or the multiple/single mode
  // changes. Without this, opening single first (selected=null) then multiple
  // leaves selected=null and selected.includes() crashes the page.
  useEffect(() => { setSelected(allowMultiple ? [] : null); }, [open, allowMultiple]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.MediaItem.list('-created_date', 100);
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (open) load(); }, [open, load]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const ext = file.name.split('.').pop()?.toLowerCase();
      const type = ['jpg','jpeg','png','webp','gif','svg'].includes(ext) ? 'image'
        : ['mp4','webm','mov'].includes(ext) ? 'video'
        : ['pdf'].includes(ext) ? 'pdf' : 'document';
      const created = await base44.entities.MediaItem.create({
        title: file.name.replace(/\.[^.]+$/, ''),
        type,
        url: file_url,
      });
      setItems((prev) => [created, ...prev]);
      if (!allowMultiple) {
        onPick(file_url, created);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleAddExternal = () => {
    if (!externalUrl.trim()) return;
    if (allowMultiple) {
      setSelected((s) => [...(Array.isArray(s) ? s : []), externalUrl]);
    } else {
      onPick(externalUrl.trim(), null);
      onClose();
    }
    setExternalUrl('');
  };

  const confirmMultiple = () => {
    onPick(Array.isArray(selected) ? selected : [], null);
    setSelected([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 items-center pb-3 border-b">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setTab('library')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${tab === 'library' ? 'bg-black text-white border-black' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'}`}
            >
              Library
            </button>
            <button
              type="button"
              onClick={() => setTab('generate')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${tab === 'generate' ? 'bg-black text-white border-black' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Generate
            </button>
          </div>
          {tab === 'library' && (
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={handleUpload} />
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#CBFF00] text-black text-sm font-medium rounded-lg hover:opacity-90">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload
              </span>
            </label>
          )}
          {tab === 'library' && (
            <div className="flex gap-2 flex-1">
              <Input placeholder="Paste external URL…" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
              <Button variant="outline" size="sm" onClick={handleAddExternal}><Link2 className="w-4 h-4" /></Button>
            </div>
          )}
        </div>
        {tab === 'generate' ? (
          <div className="flex-1 overflow-auto p-1">
            <GenerateMedia
              onSaved={(created) => setItems((prev) => [created, ...prev])}
              onInsert={(url) => {
                if (allowMultiple) {
                  setSelected((s) => { const arr = Array.isArray(s) ? s : []; return arr.includes(url) ? arr : [...arr, url]; });
                } else {
                  onPick(url, null);
                  onClose();
                }
              }}
            />
          </div>
        ) : (
        <ScrollArea className="flex-1 -mx-1 px-1">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <ImageIcon className="w-10 h-10 mb-3" />
              <p className="text-sm">No media yet. Upload your first file.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 py-3">
              {items.map((it) => {
                const selArr = Array.isArray(selected) ? selected : [];
                const isSel = allowMultiple ? selArr.includes(it.url) : selected === it.url;
                return (
                  <button
                    key={it.id}
                    onClick={() => allowMultiple ? setSelected((s) => { const arr = Array.isArray(s) ? s : []; return isSel ? arr.filter((u) => u !== it.url) : [...arr, it.url]; }) : (onPick(it.url, it), onClose())}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-neutral-100 transition ${isSel ? 'border-[#CBFF00]' : 'border-transparent hover:border-neutral-300'}`}
                  >
                    {it.type === 'image' ? (
                      <img src={it.url} alt={it.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-neutral-100 flex flex-col items-center justify-center p-2">
                        <ImageIcon className="w-6 h-6 text-neutral-400 mb-1" />
                        <span className="text-[10px] text-neutral-500 truncate w-full text-center">{it.type}</span>
                      </div>
                    )}
                    {isSel && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#CBFF00] flex items-center justify-center">
                        <Check className="w-3 h-3 text-black" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
        )}
        {allowMultiple && (
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-sm text-neutral-500">{(Array.isArray(selected) ? selected : []).length} selected</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" onClick={confirmMultiple} disabled={(Array.isArray(selected) ? selected : []).length === 0}>Insert</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}