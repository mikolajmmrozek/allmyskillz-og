import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { useSite } from '@/components/site/SiteProvider';
import { fetchPublished, fetchByIds } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import RichContent from '@/components/site/RichContent';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

export default function Home() {
  const { lang, tr, t } = useLang();
  const { home, settings, loading } = useSite();
  const [featured, setFeatured] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [news, setNews] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [projects, posts, allOffers] = await Promise.all([
          fetchPublished('Project', '-sort_order', 200),
          fetchPublished('Post', '-published_date', 100),
          fetchPublished('Offer', 'sort_order', 100),
        ]);
        const featuredIds = home?.featured_project_ids || [];
        const achIds = home?.featured_achievement_ids || [];
        const offerIds = home?.workshop_offer_ids || [];
        const feat = featuredIds.length
          ? (await fetchByIds('Project', featuredIds))
          : projects.filter((p) => p.featured).slice(0, 4);
        setFeatured(feat.length ? feat : projects.slice(0, 4));
        setAchievements(await fetchByIds('Achievement', achIds));
        setNews(posts.slice(0, home?.latest_news_count || 3));
        setOffers(offerIds.length ? await fetchByIds('Offer', offerIds) : allOffers.slice(0, 3));
      } catch (e) { console.error(e); }
    })();
  }, [home]);

  if (loading && !home) {
    return <div className="min-h-[60vh] flex items-center justify-center text-neutral-400">…</div>;
  }

  return (
    <div>
      {/* Hero */}
      <section className="px-5 md:px-10 pt-12 md:pt-24 pb-20">
        <div className="inline-flex items-center gap-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-[var(--accent,#CBFF00)]" />
          <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            {tr(home, 'focus') || t('site.projects')}
          </span>
        </div>
        <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.92] text-[15vw] md:text-[10vw] lg:text-[8.5rem] max-w-[12ch]">
          {tr(home, 'headline') || 'Living\nPortfolio.'}
        </h1>
        <div className="mt-10 grid md:grid-cols-2 gap-8 md:gap-16 items-end">
          <RichContent html={tr(home, 'intro')} className="text-lg text-neutral-600 leading-relaxed max-w-xl" />
          <div className="flex flex-wrap gap-3 md:justify-end">
            {home?.cta_primary_link && (
              <Link to={home.cta_primary_link} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent,#CBFF00)] text-black font-medium text-sm hover:opacity-90">
                {tr(home, 'cta_primary_text') || t('site.viewAll')} <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
            {home?.cta_secondary_link && (
              <Link to={home.cta_secondary_link} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-300 text-sm font-medium hover:border-black transition">
                {tr(home, 'cta_secondary_text') || t('site.getInTouch')}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Metrics */}
      {achievements.length > 0 && (
        <section className="px-5 md:px-10 py-12 border-y border-neutral-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.slice(0, 4).map((a) => (
              <div key={a.id}>
                <p className="font-display text-4xl md:text-5xl tracking-tight">{a.metric || '—'}</p>
                <p className="mt-2 text-sm text-neutral-500">{tr(a, 'title')}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured work */}
      {featured.length > 0 && (
        <section className="px-5 md:px-10 py-20">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">{t('site.featuredWork')}</h2>
            <Link to="/projects" className="text-sm text-neutral-500 hover:text-black inline-flex items-center gap-1">
              {t('site.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {featured.map((p, i) => (
              <Link key={p.id} to={`/projects/${p.slug}`} className={`group ${i === 0 ? 'md:col-span-2' : ''}`}>
                <div className={`relative overflow-hidden rounded-2xl bg-neutral-100 ${i === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                  {p.cover_image && (
                    <Image src={p.cover_image} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" />
                  )}
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
        </section>
      )}

      {/* Workshop offers */}
      {offers.length > 0 && (
        <section className="px-5 md:px-10 py-20 bg-neutral-50">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">{t('site.offers')}</h2>
            <Link to="/offers" className="text-sm text-neutral-500 hover:text-black inline-flex items-center gap-1">
              {t('site.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {offers.map((o) => (
              <Link key={o.id} to={`/offers/${o.slug}`} className="group p-8 rounded-2xl bg-white border border-neutral-200 hover:border-black transition">
                <h3 className="font-display text-2xl tracking-tight">{tr(o, 'title')}</h3>
                {o.price != null && <p className="mt-2 text-sm text-neutral-500">{o.currency || 'PLN'} {o.price}</p>}
                <span className="mt-6 inline-flex items-center gap-1 text-sm text-black">{t('site.readMore')} <ArrowUpRight className="w-4 h-4" /></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest news */}
      {news.length > 0 && (
        <section className="px-5 md:px-10 py-20">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">{t('site.latestNews')}</h2>
            <Link to="/news" className="text-sm text-neutral-500 hover:text-black inline-flex items-center gap-1">
              {t('site.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {news.map((p) => (
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
                {p.excerpt_en && <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{tr(p, 'excerpt')}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="px-5 md:px-10 py-24">
        <div className="rounded-3xl bg-[var(--accent,#CBFF00)] p-10 md:p-16 text-center">
          <h2 className="font-display text-4xl md:text-6xl tracking-tight max-w-2xl mx-auto">
            {tr(settings, 'tagline') || 'Let’s make something worth remembering.'}
          </h2>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-90">
            {t('site.getInTouch')} <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}