import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Module-level cache of { videoUrl: thumbnail_url } for all video MediaItems
// that have a cover set. Shared across every component that renders videos,
// so a cover uploaded once shows up wherever the video URL is used.
let cache = null;
let pending = null;

export function useVideoCovers() {
  const [map, setMap] = useState(cache || {});
  useEffect(() => {
    let alive = true;
    if (cache) { setMap(cache); return; }
    if (!pending) {
      pending = base44.entities.MediaItem.filter({ type: 'video' }, '-updated_date', 500)
        .then((items) => {
          const m = {};
          for (const it of items || []) {
            if (it.url && it.thumbnail_url) m[it.url] = it.thumbnail_url;
          }
          cache = m;
          return m;
        })
        .catch(() => { cache = {}; return {}; });
    }
    pending.then((m) => { if (alive) setMap(m); });
    return () => { alive = false; };
  }, []);
  return map;
}