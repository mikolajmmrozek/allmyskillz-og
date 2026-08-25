import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { fetchPublished } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import { Reveal } from '@/components/site/Motion';
import { ArrowUpRight } from 'lucide-react';

// Each card keeps its cover image's natural aspect ratio so the masonry
// columns stack with genuinely varying heights (Pinterest-style) instead of
// aligned rows. A default ratio avoids a 0-height box before first measure.
const DEFAULT_RATIO = 4 / 5;

// Cover image that keeps its natural aspect ratio so the masonry columns
// stack with varying heights instead of aligned rows.
function ProjectCover({ src, featured }) {
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-neutral-100" style={{ aspectRatio: ratio }}>
      {src && (
        <Image
          src={src}
          fittingType="fill"
          className="w-full h-full transition-transform duration-[900ms] group-hover:scale-105"
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
            if (w && h) setRatio(w / h);
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
      {featured && (
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-[var(--accent,#CBFF00)] text-black">
          Featured
        </span>
      )}
    </div>
  );
}

export default function Projects() {
  const { tr, t } = useLang();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublished('Project', '-sort_order', 200)
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-5 md:px-10 pt-20 md:pt-32 pb-20">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.24em] text-neutral-500 mb-6">{t('site.projects')}</p>
        <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[14vw] md:text-[8vw] lg:text-[7rem] max-w-[12ch]">
          {t('site.allProjects')}
        </h1>
      </Reveal>

      {loading ? (
        <div className="py-20 text-center text-neutral-400">…</div>
      ) : projects.length === 0 ? (
        <p className="mt-16 text-neutral-400">—</p>
      ) : (
        <div className="mt-16 columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.08} className="mb-6 break-inside-avoid">
              <Link to={`/projects/${p.slug}`} className="group block">
                <ProjectCover src={p.cover_image} featured={p.featured} />
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl md:text-2xl tracking-tight">{tr(p, 'title')}</h3>
                    {tr(p, 'excerpt') && <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{tr(p, 'excerpt')}</p>}
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-black shrink-0 transition" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}