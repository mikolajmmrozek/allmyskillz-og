import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Dynamic, Pinterest-like gallery: landscape images render bigger, portrait
// images taller, with a dense auto-flow so the grid stays varied (not boring).
// Click any image to open a fullscreen lightbox with prev/next + keyboard nav.
export default function GalleryMasonry({ images = [], alt = '', className = '' }) {
  const [ratios, setRatios] = useState({});
  const [active, setActive] = useState(null);

  const onLoad = (i, e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (w && h) setRatios((p) => (p[i] == null ? { ...p, [i]: w / h } : p));
  };

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

  const spanClass = (r) => {
    if (r == null) return 'col-span-1 row-span-1';
    if (r >= 1.3) return 'col-span-2 row-span-2';   // landscape -> big 2×2 emphasis
    if (r <= 0.85) return 'col-span-1 row-span-2';  // portrait -> tall
    return 'col-span-1 row-span-1';                  // square-ish
  };

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 [grid-auto-flow:dense] auto-rows-[6.5rem] sm:auto-rows-[8rem] md:auto-rows-[9rem] ${className}`}>
        {images.map((src, i) => {
          const r = ratios[i];
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`group relative overflow-hidden rounded-2xl bg-neutral-100 ${spanClass(r)}`}
            >
              <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={(e) => onLoad(i, e)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {active != null && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <button className="absolute right-4 top-4 p-2 text-white/80 hover:text-white" onClick={() => setActive(null)} aria-label="Close">
              <X className="h-6 w-6" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white"
                  onClick={(e) => { e.stopPropagation(); setActive((v) => (v - 1 + images.length) % images.length); }}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white"
                  onClick={(e) => { e.stopPropagation(); setActive((v) => (v + 1) % images.length); }}
                  aria-label="Next"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
            <img
              src={images[active]}
              alt={alt}
              className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}