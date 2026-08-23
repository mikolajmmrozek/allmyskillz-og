import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { fetchPublished, fetchByIds } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import { Reveal, ParallaxImage } from '@/components/site/Motion';

export default function News() {
  const { lang, tr, t } = useLang();
  const [posts, setPosts] = useState([]);
  const [cats, setCats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [allPosts, allCats] = await Promise.all([
          fetchPublished('Post', '-published_date', 100),
          fetchPublished('Category', 'sort_order', 100),
        ]);
        setPosts(allPosts);
        setCats(Object.fromEntries(allCats.map((c) => [c.id, c])));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const featured = posts.find((p) => p.featured) || posts[0];
  const rest = featured ? posts.filter((p) => p.id !== featured.id) : posts;
  const catName = (id) => cats[id] ? tr(cats[id], 'name') : '';

  return (
    <div className="px-5 md:px-10 pt-20 md:pt-32 pb-20">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.24em] text-neutral-500 mb-6">{t('site.news')}</p>
        <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[14vw] md:text-[8vw] lg:text-[7rem] max-w-[12ch]">
          {t('site.news')}
        </h1>
      </Reveal>

      {loading ? (
        <div className="py-20 text-center text-neutral-400">…</div>
      ) : posts.length === 0 ? (
        <p className="mt-16 text-neutral-400">—</p>
      ) : (
        <>
          {/* Featured article */}
          {featured && (
            <Link
              to={`/news/${featured.slug}`}
              className={`group mt-16 block relative rounded-3xl overflow-hidden ${featured.featured_image ? 'bg-neutral-100' : 'bg-[var(--accent,#CBFF00)]'}`}
            >
              <div className="aspect-[16/10] md:aspect-[16/8]">
                {featured.featured_image && <ParallaxImage src={featured.featured_image} className="absolute inset-0 h-full w-full" strength={6} />}
              </div>
              {featured.featured_image && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />}
              <div className={`absolute bottom-0 left-0 p-6 md:p-12 max-w-3xl ${featured.featured_image ? 'text-white' : 'text-black'}`}>
                <div className={`flex items-center gap-3 mb-4 text-[11px] uppercase tracking-[0.18em] ${featured.featured_image ? 'text-white/70' : 'text-black/60'}`}>
                  {catName(featured.category_id) && <span>{catName(featured.category_id)}</span>}
                  <span>{fmtDate(featured.published_date)}</span>
                </div>
                <h2 className="font-display text-3xl md:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.02]">{tr(featured, 'title')}</h2>
                {tr(featured, 'excerpt') && <p className={`mt-4 max-w-xl ${featured.featured_image ? 'text-white/80' : 'text-black/70'}`}>{tr(featured, 'excerpt')}</p>}
                <span className="mt-6 inline-flex items-center gap-1 text-sm">{t('site.readMore')} →</span>
              </div>
            </Link>
          )}

          {/* Grid */}
          <div className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.08}>
                <Link to={`/news/${p.slug}`} className="group block">
                  {p.featured_image && (
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 mb-4">
                      <Image src={p.featured_image} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                    {catName(p.category_id) && <span>{catName(p.category_id)}</span>}
                    <span>{fmtDate(p.published_date)}</span>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl tracking-tight mt-2 group-hover:underline">{tr(p, 'title')}</h3>
                  {tr(p, 'excerpt') && <p className="text-sm text-neutral-500 mt-2 line-clamp-3">{tr(p, 'excerpt')}</p>}
                </Link>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}