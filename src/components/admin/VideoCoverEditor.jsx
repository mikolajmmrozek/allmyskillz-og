import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import MediaPicker from '@/components/admin/MediaPicker';

// Lets the user set a cover image for a video MediaItem. The cover is chosen
// from the media library (where a new image can also be uploaded), or by
// capturing a frame directly from the video player. Stored on thumbnail_url.
export default function VideoCoverEditor({ videoUrl, mediaItemId, onSaved }) {
  const [open, setOpen] = useState(false);
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const videoRef = useRef(null);

  const saveCoverUrl = async (url) => {
    setBusy(true); setErr('');
    try {
      await base44.entities.MediaItem.update(mediaItemId, { thumbnail_url: url });
      onSaved?.(url);
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
      const file = new File([blob], `cover-${mediaItemId}.jpg`, { type: 'image/jpeg' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await saveCoverUrl(file_url);
    } catch (e) {
      console.error(e);
      setBusy(false);
      setErr('Nie udało się pobrać kadru (brak uprawnień CORS). Wybierz zdjęcie z biblioteki.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-7 h-7 rounded-lg bg-white/90 shadow flex items-center justify-center text-neutral-600 hover:text-black"
        title="Ustaw okładkę wideo"
      >
        <ImageIcon className="w-4 h-4" />
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
            Wybierz okładkę z biblioteki (tam możesz też wgrać nowe zdjęcie) lub zapisz kadr z tego wideo.
          </p>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="outline" onClick={() => setPicker(true)} disabled={busy}>
              <ImageIcon className="w-4 h-4" /> Wybierz z biblioteki
            </Button>
            <Button onClick={captureFrame} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              Zapisz kadr
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <MediaPicker open={picker} onClose={() => setPicker(false)} onPick={(url) => saveCoverUrl(url)} />
    </>
  );
}