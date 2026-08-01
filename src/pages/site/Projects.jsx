import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { fetchPublished } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import { ArrowUpRight } from 'lucide-react';

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
    <div className="px-5 md:px-10 pt-16 md:pt-24 pb-20">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-6">{t('site.projects')}</p>
      <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[12vw] md:text-[7vw] lg:text-[6.5rem]">
        {t('site.allProjects')}
      </h1>

      {loading ? (
        <div className="py-20 text-center text-neutral-400">…</div>
      ) : (
        <div className="mt-16 columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.slug}`} className="group mb-6 block break-inside-avoid">
              <div className="relative overflow-hidden rounded-2xl bg-neutral-100">
                {p.cover_image ? (
                  <Image src={p.cover_image} fittingType="fill" className="w-full transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="aspect-[4/3]" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl md:text-2xl tracking-tight">{tr(p, 'title')}</h3>
                  {p.excerpt_en && <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{tr(p, 'excerpt')}</p>}
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-black shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}