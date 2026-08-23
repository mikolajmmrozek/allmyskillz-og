import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X } from 'lucide-react';

export default function SectionNav({ sections }) {
  const [activeId, setActiveId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sectionKey = sections.map((s) => s.id).join(',');

  useEffect(() => {
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  }, []);

  if (!sections.length) return null;

  return (
    <>
      {/* Desktop: vertical dots on right side */}
      <nav className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className="group flex items-center justify-end gap-3 py-1.5"
          >
            <span className={`text-xs font-medium whitespace-nowrap transition-all duration-200 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${activeId === s.id ? 'text-black' : 'text-neutral-400'}`}>
              {s.label}
            </span>
            <span className={`w-2 h-2 rounded-full transition-all duration-300 ${activeId === s.id ? 'bg-[var(--accent,#CBFF00)] scale-150 ring-2 ring-black/5' : 'bg-neutral-300 group-hover:bg-neutral-500'}`} />
          </button>
        ))}
      </nav>

      {/* Mobile: floating button + dropdown */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-16 right-0 w-60 rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl"
              >
                {sections.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${activeId === s.id ? 'bg-[var(--accent,#CBFF00)] text-black' : 'hover:bg-neutral-100 text-neutral-700'}`}
                  >
                    <span className={`text-xs ${activeId === s.id ? 'text-black/40' : 'text-neutral-300'}`}>{String(i + 1).padStart(2, '0')}</span>
                    {s.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          {mobileOpen ? <X size={20} /> : <List size={20} />}
        </button>
      </div>
    </>
  );
}