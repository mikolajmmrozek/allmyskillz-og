import React from 'react';
import { useVideoCovers } from './useVideoCovers';

// Extracts the YouTube video ID from common URL formats:
//   https://www.youtube.com/watch?v=ID
//   https://youtu.be/ID
//   https://www.youtube.com/embed/ID
//   https://www.youtube.com/shorts/ID
function getYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/v\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getVimeoId(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

/**
 * Renders a video URL. YouTube and Vimeo links are embedded as responsive
 * iframes; everything else falls back to a native <video> element.
 */
export default function VideoEmbed({ url, className = '' }) {
  const covers = useVideoCovers();
  if (!url) return null;

  const ytId = getYouTubeId(url);
  const vimeoId = !ytId ? getVimeoId(url) : null;

  if (ytId) {
    return (
      <div className={`relative w-full overflow-hidden rounded-2xl bg-black ${className}`}>
        <div className="relative pb-[56.25%] h-0">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${ytId}`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (vimeoId) {
    return (
      <div className={`relative w-full overflow-hidden rounded-2xl bg-black ${className}`}>
        <div className="relative pb-[56.25%] h-0">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title="Vimeo video"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return <video src={url} poster={covers[url]} controls className={`w-full rounded-2xl bg-black ${className}`} />;
}