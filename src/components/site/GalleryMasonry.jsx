import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Image } from '@/components/ui/image';

// Organic masonry: each image's row-span is computed from its natural aspect
// ratio, so portrait images become tall in varying heights (not lined up),
// while landscape images span two columns. A dense auto-flow fills gaps.
// Click any item to open a fullscreen lightbox with prev/next + keyboard nav.
// Supports images (incl. HEIC via CDN conversion) and direct video files (mp4…).
const ROW_PX = 120;
const GAP_PX = 12;

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg|ogv)$/i;
export const isVideoUrl = (url = '') => VIDEO_EXT.test(url);

export default function GalleryMasonry({ images = [], alt = '', className = '' }) {
  const [ratios, setRatios] = useState({});
  const [spans, setSpans] = useState({});
  const [colWidth, setColWidth] = useState(0);
  const [active, setActive] = useState(null);
  const gridRef = useRef(null);

  const onLoad = (i, e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (w && h) setRatios((p) => (p[i] == null ? { ...p, [i]: w / h } : p));
  };

  // Measure one column's pixel width so we can size row-spans to natural ratios.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const compute = () => {
      const cols = window.getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
      if (!cols) return;
      setColWidth((grid.clientWidth - GAP_PX * (cols - 1)) / cols);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(grid);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!colWidth) return;
    const next = {};
    images.forEach((src, i) => {
      const r = isVideoUrl(src) ? 16 / 9 : ratios[i];
      if (r == null) { next[i] = { col: 1, row: 3 }; return; }
      const col = r >= 1.4 ? 2 : 1;                       // landscape → wider
      const cellW = colWidth * col + GAP_PX * (col - 1);
      const naturalH = cellW / r;
      let row = Math.round((naturalH + GAP_PX) / (ROW_PX + GAP_PX));
      row = Math.max(2, Math.min(row, 6));
      next[i] = { col, row };
    });
    setSpans(next);
  }, [ratios, colWidth, images]);

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
      <div
        ref={gridRef}
        style={{ gridAutoRows: ROW_PX }}
        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 [grid-auto-flow:dense] ${className}`}
      >
        {images.map((src, i) => {
          const s = spans[i] || { col: 1, row: 3 };
          const video = isVideoUrl(src);
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              style={{ gridColumn: `span ${s.col}`, gridRow: `span ${s.row}` }}
              className="group relative overflow-hidden rounded-2xl bg-neutral-100"
            >
              {video ? (
                <>
                  {/* #t=0.1 forces the browser to decode & show a real frame
                      instead of a black square before the first paint. */}
                  <video
                    src={`${src}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute bottom-2 left-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                    <Play className="h-4 w-4 translate-x-0.5 fill-current" />
                  </span>
                </>
              ) : (
                <Image
                  src={src}
                  alt={alt}
                  fittingType="fill"
                  loading="lazy"
                  onLoad={(e) => onLoad(i, e)}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
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