import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { fetchPublished } from '@/lib/siteData';
import { Image } from '@/components/ui/image';

export default function News() {
  const { lang, tr, t } = useLang();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublished('Post', '-published_date', 100)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = posts.find((p) => p.featured) || posts[0];
  const rest = featured ? posts.filter((p) => p.id !== featured.id) : posts;

  return (
    <div className="px-5 md:px-10 pt-16 md:pt-24 pb-20">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-6">{t('site.news')}</p>
      <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[12vw] md:text-[7vw] lg:text-[6.5rem]">
        {t('site.news')}
      </h1>

      {loading ? (
        <div className="py-20 text-center text-neutral-400">…</div>
      ) : posts.length === 0 ? null : (
        <>
          {featured && (
            <Link to={`/news/${featured.slug}`} className="group mt-16 grid md:grid-cols-2 gap-8 items-center pb-16 border-b border-neutral-200">
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-100">
                {featured.featured_image && <Image src={featured.featured_image} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" />}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                  {featured.published_date ? new Date(featured.published_date).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </p>
                <h2 className="font-display text-3xl md:text-4xl tracking-tight mt-3 group-hover:underline">{tr(featured, 'title')}</h2>
                {featured.excerpt_en && <p className="text-neutral-600 mt-4 max-w-xl">{tr(featured, 'excerpt')}</p>}
                <span className="mt-6 inline-flex items-center gap-1 text-sm">{t('site.readMore')} →</span>
              </div>
            </Link>
          )}

          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <Link key={p.id} to={`/news/${p.slug}`} className="group">
                {p.featured_image && (
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 mb-4">
                    <Image src={p.featured_image} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" />
                  </div>
                )}
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                  {p.published_date ? new Date(p.published_date).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </p>
                <h3 className="font-display text-xl tracking-tight mt-2 group-hover:underline">{tr(p, 'title')}</h3>
                {p.excerpt_en && <p className="text-sm text-neutral-500 mt-2 line-clamp-3">{tr(p, 'excerpt')}</p>}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}