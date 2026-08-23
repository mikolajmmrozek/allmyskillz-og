import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/i18n';
import { useSite } from '@/components/site/SiteProvider';
import { fetchPublished, fetchByIds } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import RichContent from '@/components/site/RichContent';
import { Reveal, ParallaxImage } from '@/components/site/Motion';
import SiteLogo from '@/components/site/SiteLogo';
import { ARTIST_NAME_LINES } from '@/lib/brand';
import { ArrowUpRight, ArrowRight, MoveDown } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1];

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

  // The name is a constant proper noun — never translated.
  const lines = ARTIST_NAME_LINES;
  const heroVideo = home?.hero_video_url;
  const heroPoster = home?.hero_poster_url;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  if (loading && !home) {
    return <div className="min-h-[60vh] flex items-center justify-center text-neutral-400">…</div>;
  }

  return (
    <div>
      {/* Hero — fullscreen profile video / poster */}
      <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-neutral-900">
        {heroVideo ? (
          <video
            key={heroVideo}
            autoPlay
            muted
            loop
            playsInline
            poster={heroPoster}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={heroVideo} />
          </video>
        ) : heroPoster ? (
          <div className="absolute inset-0">
            <Image src={heroPoster} fittingType="fill" className="h-full w-full" />
          </div>
        ) : (
          <div className="absolute inset-0 mesh-bg-dark bg-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/75" />

        <div className="relative z-10 h-full flex flex-col justify-between px-5 md:px-10 pt-24 pb-12 md:pb-16 text-white">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent,#CBFF00)]" />
            <span className="text-[11px] uppercase tracking-[0.26em] text-white/70">
              {tr(home, 'focus') || t('site.projects')}
            </span>
          </div>

          <div>
            <div className="flex items-end gap-6 md:gap-10">
              <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.9] text-[16vw] md:text-[11vw] lg:text-[9rem] max-w-[14ch]">
                {lines.map((ln, i) => (
                  <span key={i} className="block overflow-hidden">
                    <motion.span
                      className="block"
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.95, delay: 0.15 + i * 0.12, ease: EASE }}
                    >
                      {ln}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
                className="hidden md:block shrink-0 mb-3 lg:mb-5"
              >
                <SiteLogo tone="light" size={150} className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]" />
              </motion.div>
            </div>

            <div className="mt-8 md:mt-12 grid md:grid-cols-2 gap-8 md:gap-16 items-end">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
              >
                <RichContent html={tr(home, 'intro')} className="text-base md:text-lg text-white/80 leading-relaxed max-w-xl" />
              </motion.div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                {home?.cta_primary_link && (
                  <Link to={home.cta_primary_link} className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent,#CBFF00)] text-black font-medium text-sm hover:scale-[1.03] transition">
                    {tr(home, 'cta_primary_text') || t('site.viewAll')}
                    <ArrowUpRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
                  </Link>
                )}
                {home?.cta_secondary_link && (
                  <Link to={home.cta_secondary_link} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition">
                    {tr(home, 'cta_secondary_text') || t('site.getInTouch')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MoveDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* Artist statement — current creative focus */}
      <section className="px-5 md:px-10 py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <Reveal className="md:col-span-3">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent,#CBFF00)]" />
              {t('site.about')}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-9">
            <p className="font-display text-2xl md:text-4xl lg:text-5xl tracking-[-0.02em] leading-[1.12] max-w-4xl">
              {tr(home, 'focus') || tr(settings, 'tagline') || (lang === 'pl' ? 'Artysta multidyscyplinarny badający relację między opowieścią, obrazem i tożsamością w różnych mediach.' : 'A multidisciplinary artist exploring story, image and identity across mediums.')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Metrics */}
      {achievements.length > 0 && (
        <section className="px-5 md:px-10 py-12 border-y border-neutral-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.slice(0, 4).map((a, i) => (
              <Reveal key={a.id} delay={i * 0.08}>
                <p className="font-display text-4xl md:text-6xl tracking-tight">{a.metric || '—'}</p>
                <p className="mt-2 text-sm text-neutral-500 max-w-[20ch]">{tr(a, 'title')}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Featured work */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28">
          {featured[0] && (
            <Link to={`/projects/${featured[0].slug}`} className="group block relative h-[78svh] min-h-[460px] overflow-hidden">
              {featured[0].cover_image && (
                <ParallaxImage src={featured[0].cover_image} className="absolute inset-0 h-full w-full" strength={8} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end px-5 md:px-10 pb-10 md:pb-16 text-white">
                <Reveal>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60 mb-3">{t('site.featuredWork')}</p>
                  <h2 className="font-display text-4xl md:text-7xl tracking-[-0.02em] max-w-[16ch]">{tr(featured[0], 'title')}</h2>
                  {tr(featured[0], 'excerpt') && <p className="mt-4 max-w-xl text-white/80">{tr(featured[0], 'excerpt')}</p>}
                  <span className="mt-6 inline-flex items-center gap-1 text-sm">{t('site.readMore')} <ArrowUpRight className="w-4 h-4 transition group-hover:text-[var(--accent,#CBFF00)]" /></span>
                </Reveal>
              </div>
            </Link>
          )}
          {featured.length > 1 && (
            <div className="px-5 md:px-10 mt-6 grid gap-6 md:grid-cols-2">
              {featured.slice(1).map((p, i) => (
                <Reveal key={p.id} delay={i * 0.1}>
                  <Link to={`/projects/${p.slug}`} className="group block">
                    <div className="relative overflow-hidden rounded-2xl bg-neutral-100 aspect-[4/3]">
                      {p.cover_image && <ParallaxImage src={p.cover_image} className="absolute inset-0 h-full w-full" strength={5} />}
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-xl md:text-2xl tracking-tight">{tr(p, 'title')}</h3>
                        {tr(p, 'excerpt') && <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{tr(p, 'excerpt')}</p>}
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-[var(--accent,#CBFF00)] shrink-0 transition" />
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Workshop offers */}
      {offers.length > 0 && (
        <section className="px-5 md:px-10 py-20 md:py-28 bg-neutral-50">
          <div className="flex items-end justify-between mb-10">
            <Reveal><h2 className="font-display text-3xl md:text-5xl tracking-tight">{t('site.offers')}</h2></Reveal>
            <Link to="/offers" className="text-sm text-neutral-500 hover:text-black inline-flex items-center gap-1 group/offers">
              {t('site.viewAll')} <ArrowRight className="w-4 h-4 transition group-hover/offers:translate-x-0.5 group-hover/offers:text-[var(--accent,#CBFF00)]" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {offers.map((o, i) => (
              <Reveal key={o.id} delay={i * 0.1}>
                <Link to={`/offers/${o.slug}`} className="group flex flex-col h-full p-8 rounded-2xl bg-white border border-neutral-200 hover:border-black hover:-translate-y-1 transition">
                  <h3 className="font-display text-2xl tracking-tight">{tr(o, 'title')}</h3>
                  {tr(o, 'cta_text') && <p className="text-sm text-neutral-600 mt-3 line-clamp-3">{tr(o, 'cta_text')}</p>}
                  {o.price != null && <p className="mt-4 text-sm text-neutral-500">{o.currency || 'PLN'} {o.price}</p>}
                  <span className="mt-6 inline-flex items-center gap-1 text-sm text-black">{t('site.readMore')} <ArrowUpRight className="w-4 h-4" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Latest journal */}
      {news.length > 0 && (
        <section className="px-5 md:px-10 py-20 md:py-28">
          <div className="flex items-end justify-between mb-10">
            <Reveal><h2 className="font-display text-3xl md:text-5xl tracking-tight">{t('site.latestNews')}</h2></Reveal>
            <Link to="/news" className="text-sm text-neutral-500 hover:text-black inline-flex items-center gap-1 group/news">
              {t('site.viewAll')} <ArrowRight className="w-4 h-4 transition group-hover/news:translate-x-0.5 group-hover/news:text-[var(--accent,#CBFF00)]" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {news.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
                <Link to={`/news/${p.slug}`} className="group">
                  {p.featured_image && (
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 mb-4">
                      <Image src={p.featured_image} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  )}
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">{fmtDate(p.published_date)}</p>
                  <h3 className="font-display text-xl tracking-tight mt-2 group-hover:underline">{tr(p, 'title')}</h3>
                  {tr(p, 'excerpt') && <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{tr(p, 'excerpt')}</p>}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="px-5 md:px-10 py-20 md:py-28">
        <div className="relative rounded-3xl bg-[var(--accent,#CBFF00)] p-10 md:p-20 text-center overflow-hidden">
          <div className="mesh-bg absolute inset-0 opacity-50 pointer-events-none" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-7xl tracking-[-0.02em] max-w-3xl mx-auto">
              {tr(settings, 'tagline') || (lang === 'pl' ? 'Stwórzmy coś, co warto zapamiętać.' : 'Let’s make something worth remembering.')}
            </h2>
            <Link to="/contact" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-90">
              {t('site.getInTouch')} <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}