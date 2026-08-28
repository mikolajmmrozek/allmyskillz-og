import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { thumbUrl } from '@/lib/media';
import { useVideoCovers } from './useVideoCovers';

// True Pinterest masonry via CSS multi-column layout: each image flows at its
// natural aspect ratio (width = column width, height auto), so heights vary
// organically with no JS measurement. Click any item for a fullscreen lightbox.
// Supports images and direct video files (mp4…).
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg|ogv)$/i;
export const isVideoUrl = (url = '') => VIDEO_EXT.test(url);

export default function GalleryMasonry({ images = [], alt = '', className = '' }) {
  const covers = useVideoCovers();
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (active == null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null);
      else if (e.key === 'ArrowRight') setActive((v) => (v == null ? v : (v + 1) % images.length));
      else if (e.key === 'ArrowLeft') setActive((v) => (v == null ? v : (v - 1 + images.length) % images.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, images.length]);

  return (
    <>
      <div className={`columns-2 md:columns-3 lg:columns-4 gap-3 ${className}`}>
        {images.map((src, i) => {
          const video = isVideoUrl(src);
          const cover = covers[src];
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className="group relative mb-3 block w-full overflow-hidden rounded-2xl bg-neutral-100 break-inside-avoid"
            >
              {video ? (
                <>
                  {cover ? (
                    <img
                      src={thumbUrl(cover, 700)}
                      alt={alt}
                      loading="lazy"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    /* #t=0.1 forces the browser to decode & show a real frame
                       instead of a black square before the first paint. */
                    <video
                      src={`${src}#t=0.1`}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  )}
                  <span className="absolute bottom-2 left-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                    <Play className="h-4 w-4 translate-x-0.5 fill-current" />
                  </span>
                </>
              ) : (
                <img
                  src={thumbUrl(src, 700)}
                  alt={alt}
                  loading="lazy"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              )}
            </button>
          );
        })}
      </div>

      {createPortal(
        <AnimatePresence>
          {active != null && (
            <motion.div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
            >
              <button className="absolute right-4 top-4 z-20 p-2 text-white/80 hover:text-white" onClick={() => setActive(null)} aria-label="Close">
                <X className="h-6 w-6" />
              </button>
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-3 top-1/2 z-20 -translate-y-1/2 p-2 text-white/80 hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setActive((v) => (v - 1 + images.length) % images.length); }}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    className="absolute right-3 top-1/2 z-20 -translate-y-1/2 p-2 text-white/80 hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setActive((v) => (v + 1) % images.length); }}
                    aria-label="Next"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}
              {(() => {
                const src = images[active];
                // Plain <img>/<video> (not the Image component): the Image
                // component stacks a blurred placeholder + main img inside a
                // dimensionless wrapper, which leaks a floating thumbnail over
                // the video. Plain elements render cleanly and stay on top.
                if (isVideoUrl(src)) {
                  return (
                    <video
                      src={src}
                      controls
                      autoPlay
                      playsInline
                      className="relative z-10 max-h-[88vh] max-w-[92vw] rounded-lg bg-black"
                      onClick={(e) => e.stopPropagation()}
                    />
                  );
                }
                return (
                  <img
                    src={src}
                    alt={alt}
                    className="relative z-10 max-h-[88vh] max-w-[92vw] rounded-lg object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}