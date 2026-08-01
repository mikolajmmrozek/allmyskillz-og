import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Save, Plus, Film, Image as ImageIcon, Check } from 'lucide-react';

const pill = (active) =>
  `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
    active ? 'bg-black text-white border-black' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
  }`;

// AI-assisted media generation. Generates images or videos from a prompt via
// the Core integrations, then lets the admin save the result into the Media
// Library (MediaItem) and optionally insert it directly.
export default function GenerateMedia({ onSaved, onInsert, compact = false }) {
  const [mode, setMode] = useState('image');
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState('16:9');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { url, type }
  const [saved, setSaved] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setBusy(true); setSaved(false); setResult(null);
    try {
      if (mode === 'image') {
        const res = await base44.integrations.Core.GenerateImage({ prompt });
        setResult({ url: res.url, type: 'image' });
      } else {
        const res = await base44.integrations.Core.GenerateVideo({ prompt, aspect_ratio: aspect });
        setResult({ url: res.url, type: 'video' });
      }
    } catch (e) {
      alert(e?.message || 'Generation failed');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!result) return;
    try {
      const title = prompt.trim().slice(0, 80) || (mode === 'image' ? 'Generated image' : 'Generated video');
      const created = await base44.entities.MediaItem.create({ title, type: result.type, url: result.url });
      setSaved(true);
      onSaved?.(created);
    } catch (e) {
      alert(e?.message || 'Save failed');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => { setMode('image'); setResult(null); setSaved(false); }} className={pill(mode === 'image')}>
          <ImageIcon className="w-3.5 h-3.5" /> Image
        </button>
        <button type="button" onClick={() => { setMode('video'); setResult(null); setSaved(false); }} className={pill(mode === 'video')}>
          <Film className="w-3.5 h-3.5" /> Video
        </button>
      </div>

      <Textarea
        placeholder={mode === 'image' ? 'Describe the image to generate…' : 'Describe the video to generate…'}
        rows={compact ? 2 : 3}
        value={prompt}
        onChange={(e) => { setPrompt(e.target.value); setSaved(false); }}
      />

      {mode === 'video' && (
        <div className="flex gap-2">
          {['16:9', '9:16'].map((a) => (
            <button key={a} type="button" onClick={() => setAspect(a)} className={pill(aspect === a)}>{a}</button>
          ))}
        </div>
      )}

      <Button type="button" onClick={generate} disabled={busy || !prompt.trim()} className="w-full bg-[#CBFF00] text-black hover:opacity-90">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {busy ? (mode === 'video' ? 'Generating video…' : 'Generating…') : 'Generate'}
      </Button>

      {busy && mode === 'video' && (
        <p className="text-xs text-neutral-400">Video generation takes about 30–60 seconds…</p>
      )}

      {result && (
        <div className="border border-neutral-200 rounded-xl p-3 space-y-3 bg-white">
          {result.type === 'image'
            ? <img src={result.url} alt="generated" className="w-full rounded-lg" />
            : <video src={result.url} controls className="w-full rounded-lg bg-black" />}
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={save} disabled={saved} className="flex-1">
              {saved ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save to library</>}
            </Button>
            {onInsert && (
              <Button type="button" size="sm" onClick={() => onInsert(result.url, null)} className="flex-1 bg-black text-white hover:opacity-90">
                <Plus className="w-4 h-4" /> Insert
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}