import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { thumbUrl } from '@/lib/media';

// Award image gallery: merges the single `image` with the `gallery` array
// (deduped, empties dropped), shows up to 3 small preview tiles in the card,
// and opens a fullscreen lightbox (full-size) on click with prev/next + kb nav.
export default function AwardGallery({ image, gallery = [], alt = '', className = '' }) {
  const all = useMemo(() => {
    const arr = [image, ...(gallery || [])].filter(Boolean);
    return Array.from(new Set(arr));
  }, [image, gallery]);

  const [active, setActive] = useState(null);

  useEffect(() => {
    if (active == null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null);
      else if (e.key === 'ArrowRight') setActive((v) => (v == null ? v : (v + 1) % all.length));
      else if (e.key === 'ArrowLeft') setActive((v) => (v == null ? v : (v - 1 + all.length) % all.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, all.length]);

  if (all.length === 0) return null;

  const preview = all.slice(0, 3);
  const remaining = all.length - preview.length;
  const cols = preview.length === 1 ? 'grid-cols-1' : preview.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <>
      <div className={`grid ${cols} gap-2 mb-4 ${className}`}>
        {preview.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className="relative group overflow-hidden rounded-xl bg-neutral-100 aspect-[4/3]"
          >
            <img
              src={thumbUrl(src, 500)}
              alt={alt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {i === preview.length - 1 && remaining > 0 && (
              <span className="absolute inset-0 bg-black/55 text-white flex items-center justify-center font-display text-xl">
                +{remaining}
              </span>
            )}
          </button>
        ))}
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
              {all.length > 1 && (
                <>
                  <button
                    className="absolute left-3 top-1/2 z-20 -translate-y-1/2 p-2 text-white/80 hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setActive((v) => (v - 1 + all.length) % all.length); }}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    className="absolute right-3 top-1/2 z-20 -translate-y-1/2 p-2 text-white/80 hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setActive((v) => (v + 1) % all.length); }}
                    aria-label="Next"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}
              <img
                src={all[active]}
                alt={alt}
                className="relative z-10 max-h-[88vh] max-w-[92vw] rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}