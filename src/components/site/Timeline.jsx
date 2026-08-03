import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLang } from '@/lib/i18n';
import { Image } from '@/components/ui/image';
import RichContent from '@/components/site/RichContent';
import { Plus } from 'lucide-react';

// Sticky scroll-driven timeline. Active item is tracked via IntersectionObserver
// and mirrored in a sticky left rail with an animated progress line.
export default function Timeline({ items, render, idKey = 'id' }) {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 140px', 'end start'] });
  const lineH = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    if (!items.length) return;
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll('[data-idx]'));
    const observers = [];
    els.forEach((el, i) => {
      const ob = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(i); }),
        { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
      );
      ob.observe(el);
      observers.push(ob);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [items.length]);

  if (!items.length) return null;

  return (
    <div ref={ref} className="grid md:grid-cols-[1fr_1.7fr] gap-8 md:gap-16">
      <div className="hidden md:block">
        <div className="sticky top-28">
          <div className="relative pl-6">
            <div className="absolute left-0 top-1 bottom-1 w-px bg-neutral-200" />
            <motion.div className="absolute left-0 top-1 w-px bg-[var(--accent,#CBFF00)]" style={{ height: lineH }} />
            <p className="text-xs tabular-nums uppercase tracking-[0.2em] text-neutral-400">{render.period(items[active])}</p>
            <h3 className="font-display text-2xl md:text-3xl tracking-[-0.02em] mt-2 max-w-[20ch]">{render.title(items[active])}</h3>
            <p className="text-sm text-neutral-500 mt-1">{render.subtitle(items[active])}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => (
          <TimelineItem key={it[idKey]} item={it} index={i} active={active === i} render={render} />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ item, index, active, render }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      id={item.slug || undefined}
      data-idx={index}
      className={`rounded-2xl border transition-all duration-500 ${active ? 'border-black bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)]' : 'border-neutral-200 bg-white/50'}`}
    >
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left p-5 md:p-6 flex items-start gap-4">
        <div className="flex-1">
          <p className="text-xs tabular-nums text-neutral-400">{render.period(item)}</p>
          <h3 className="font-display text-xl md:text-2xl tracking-tight mt-1">{render.title(item)}</h3>
          <p className="text-sm text-neutral-500 mt-1">{render.subtitle(item)}</p>
        </div>
        <span className={`shrink-0 mt-1 grid place-items-center w-8 h-8 rounded-full border border-neutral-200 transition-transform duration-300 ${open ? 'rotate-45 bg-[var(--accent,#CBFF00)] border-transparent' : ''}`}>
          <Plus className="w-4 h-4" />
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="px-5 md:px-6 pb-6">
          {render.body && render.body(item) && (
            <RichContent html={render.body(item)} className="text-sm text-neutral-700 max-w-2xl mt-1" />
          )}
          {render.media && render.media(item)}
        </div>
      </motion.div>
    </div>
  );
}