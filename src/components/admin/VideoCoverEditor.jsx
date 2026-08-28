import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Camera, ImagePlus } from 'lucide-react';

// Lets the user set a cover image for a video MediaItem: either by capturing
// the current frame from the video player, or by uploading a custom image.
// The chosen image is stored on MediaItem.thumbnail_url.
export default function VideoCoverEditor({ videoUrl, mediaItemId, onSaved }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const videoRef = useRef(null);
  const fileRef = useRef(null);

  const saveCover = async (file) => {
    setBusy(true); setErr('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.MediaItem.update(mediaItemId, { thumbnail_url: file_url });
      onSaved?.(file_url);
      setOpen(false);
    } catch (e) {
      console.error(e);
      setErr('Nie udało się zapisać okładki.');
    } finally { setBusy(false); }
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) { setErr('Wideo nie jest jeszcze wczytane — poczekaj chwilę.'); return; }
    setBusy(true); setErr('');
    try {
      video.pause();
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
      if (!blob) throw new Error('capture failed');
      await saveCover(new File([blob], `cover-${mediaItemId}.jpg`, { type: 'image/jpeg' }));
    } catch (e) {
      console.error(e);
      setBusy(false);
      setErr('Nie udało się pobrać kadru (brak uprawnień CORS). Wgraj zdjęcie ręcznie.');
    }
  };

  const uploadImage = (e) => {
    const file = e.target.files?.[0];
    if (file) saveCover(file);
    e.target.value = '';
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-7 h-7 rounded-lg bg-white/90 shadow flex items-center justify-center text-neutral-600 hover:text-black"
        title="Ustaw okładkę wideo"
      >
        <ImagePlus className="w-4 h-4" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ustaw okładkę wideo</DialogTitle>
          </DialogHeader>
          <video
            ref={videoRef}
            src={videoUrl}
            crossOrigin="anonymous"
            controls
            playsInline
            className="w-full max-h-[50vh] rounded-lg bg-black"
          />
          <p className="text-xs text-neutral-500">
            Przewiń wideo do wybranego momentu i kliknij „Zapisz kadr”, albo wgraj własne zdjęcie.
          </p>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={captureFrame} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              Zapisz kadr
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
              <ImagePlus className="w-4 h-4" /> Wgraj zdjęcie
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImage} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}