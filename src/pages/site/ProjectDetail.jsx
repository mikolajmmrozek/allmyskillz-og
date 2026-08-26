import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { fetchBySlug, fetchByIds } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import RichContent from '@/components/site/RichContent';
import { Reveal } from '@/components/site/Motion';
import GalleryMasonry from '@/components/site/GalleryMasonry';
import AwardGallery from '@/components/site/AwardGallery';
import VideoEmbed from '@/components/site/VideoEmbed';
import PartnerLogos from '@/components/site/PartnerLogos';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useSEO } from '@/hooks/use-seo';
import { creativeWorkJsonLd } from '@/lib/seo';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { lang, tr, t } = useLang();
  const [project, setProject] = useState(null);
  const [related, setRelated] = useState({ achievements: [], awards: [], experience: [], partners: [], news: [], categories: [], tags: [] });
  const [loading, setLoading] = useState(true);

  useSEO({
    title: project && (tr(project, 'seo_title') || tr(project, 'title')),
    description: project && (tr(project, 'seo_description') || tr(project, 'excerpt')),
    image: project?.cover_image,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    jsonLd: project ? creativeWorkJsonLd(project, '/projects/' + slug) : undefined,
  });

  useEffect(() => {
    setLoading(true);
    fetchBySlug('Project', slug).then(async (p) => {
      setProject(p);
      if (p) {
        const [achievements, awards, experience, partners, news, categories, tags] = await Promise.all([
          fetchByIds('Achievement', p.achievement_ids || []),
          fetchByIds('Award', p.award_ids || []),
          fetchByIds('Experience', p.experience_ids || []),
          fetchByIds('Partner', p.partner_ids || []),
          fetchByIds('Post', p.post_ids || []),
          fetchByIds('Category', p.category_ids || []),
          fetchByIds('Tag', p.tag_ids || []),
        ]);
        setRelated({ achievements, awards, experience, partners, news, categories, tags });
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="px-5 md:px-10 py-32 text-center text-neutral-400">…</div>;
  if (!project) return <div className="px-5 md:px-10 py-32 text-center text-neutral-400">Not found.</div>;

  const gallery = project.gallery || [];
  const videos = project.videos || [];
  const story = tr(project, 'story');

  return (
    <div>
      <div className="px-5 md:px-10 pt-10">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> {t('site.backToAll')}
        </Link>
      </div>

      {/* Header */}
      <header className="px-5 md:px-10 pt-10 pb-10">
        {related.categories.length > 0 && (
          <Reveal className="flex flex-wrap gap-2 mb-6">
            {related.categories.map((c) => (
              <span key={c.id} className="text-xs uppercase tracking-[0.16em] text-neutral-500">{tr(c, 'name')}</span>
            ))}
          </Reveal>
        )}
        <Reveal delay={0.05}>
          <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[11vw] md:text-[6.5vw] lg:text-[6rem] max-w-[14ch]">
            {tr(project, 'title')}
          </h1>
        </Reveal>
        {tr(project, 'excerpt') && (
          <Reveal delay={0.15}>
            <p className="mt-6 text-lg md:text-xl text-neutral-600 max-w-2xl leading-relaxed">{tr(project, 'excerpt')}</p>
          </Reveal>
        )}
        {related.tags.length > 0 && (
          <Reveal delay={0.2} className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
            {related.tags.map((tg) => (
              <span key={tg.id} className="text-sm text-neutral-400">#{tr(tg, 'name').replace(/\s+/g, '')}</span>
            ))}
          </Reveal>
        )}
      </header>

      {/* Cover */}
      {project.cover_image && (
        <div className="px-5 md:px-10">
          <div className="rounded-3xl overflow-hidden bg-neutral-100 aspect-[16/9]">
            <img src={project.cover_image} alt={tr(project, 'title')} className="h-full w-full object-cover" />
          </div>
        </div>
      )}

      {/* Partner logos — credit band below the cover */}
      <PartnerLogos partners={related.partners} label={t('site.collaboration')} />

      {/* Story + sticky sidebar */}
      {(story || related.partners.length > 0 || related.experience.length > 0) && (
        <div className="px-5 md:px-10 py-16 md:py-24 grid md:grid-cols-[1fr_2.2fr] gap-8 md:gap-16">
          <aside className="md:sticky md:top-24 md:self-start space-y-8">
            {related.partners.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 mb-3">{t('site.partners')}</p>
                <ul className="space-y-3">
                  {related.partners.map((pa) => (
                    <li key={pa.id} className="text-sm">
                      {pa.website ? (
                        <a href={pa.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-black transition">
                          {pa.logo_url && <img src={pa.logo_url} alt={tr(pa, 'name')} className="h-7 w-auto object-contain grayscale opacity-60" />}
                          <span>{tr(pa, 'name')}</span> <ArrowUpRight className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          {pa.logo_url && <img src={pa.logo_url} alt={tr(pa, 'name')} className="h-7 w-auto object-contain grayscale opacity-60" />}
                          {tr(pa, 'name')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {related.experience.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 mb-3">{lang === 'pl' ? 'Powiązane doświadczenie' : 'Related experience'}</p>
                <ul className="space-y-1.5">
                  {related.experience.map((ex) => (
                    <li key={ex.id} className="text-sm text-neutral-600">
                      <span className="text-neutral-400 tabular-nums mr-2">{ex.start_year}{ex.end_year ? '–' + ex.end_year : ''}</span>
                      <Link to={`/about#${ex.slug || ex.id}`} className="hover:underline hover:text-black transition">
                        {tr(ex, 'position')} · {tr(ex, 'company')}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
          {story && (
            <Reveal>
              <RichContent html={story} className="text-lg leading-relaxed text-neutral-700 max-w-[65ch]" />
            </Reveal>
          )}
        </div>
      )}

      {/* Gallery — dynamic masonry + lightbox */}
      {gallery.length > 0 && (
        <div className="px-5 md:px-10 pb-16">
          <GalleryMasonry images={gallery} alt={tr(project, 'title')} />
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div className="px-5 md:px-10 pb-16 grid gap-4">
          {videos.map((v, i) => (
            <VideoEmbed key={i} url={v} />
          ))}
        </div>
      )}

      {/* Achievements */}
      {related.achievements.length > 0 && (
        <section className="px-5 md:px-10 py-16 md:py-20 border-t border-neutral-200">
          <Reveal><h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">{lang === 'pl' ? 'Osiągnięcia' : 'Achievements'}</h2></Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {related.achievements.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.08}>
                <div className="p-6 rounded-2xl bg-[var(--accent,#CBFF00)] text-black">
                  {a.metric && <p className="font-display text-4xl tracking-tight">{a.metric}</p>}
                  <h3 className="font-medium mt-2">{tr(a, 'title')}</h3>
                  <RichContent html={tr(a, 'description')} className="text-sm text-black/70 mt-2 [&_a]:text-black [&_a]:underline" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Awards */}
      {related.awards.length > 0 && (
        <section className="px-5 md:px-10 py-16 md:py-20 border-t border-neutral-200">
          <Reveal><h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">{lang === 'pl' ? 'Nagrody' : 'Awards'}</h2></Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {related.awards.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.08}>
                <div className="p-6 rounded-2xl border border-neutral-200">
                  <AwardGallery image={a.image} gallery={a.gallery} alt={tr(a, 'title')} />
                  <h3 className="font-medium">{tr(a, 'title')}</h3>
                  <p className="text-sm text-neutral-500">{a.issuer}{a.date ? ' · ' + new Date(a.date).getFullYear() : ''}</p>
                  <RichContent html={tr(a, 'description')} className="text-sm text-neutral-600 mt-2" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Related news */}
      {related.news.length > 0 && (
        <section className="px-5 md:px-10 py-16 md:py-20 border-t border-neutral-200">
          <Reveal><h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">{t('site.relatedNews')}</h2></Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {related.news.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <Link to={`/news/${p.slug}`} className="group">
                  {p.featured_image && (
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 mb-4">
                      <Image src={p.featured_image} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  )}
                  <h3 className="font-display text-lg tracking-tight group-hover:underline">{tr(p, 'title')}</h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}