import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { fetchBySlug, fetchByIds } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import RichContent from '@/components/site/RichContent';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { lang, tr, t } = useLang();
  const [project, setProject] = useState(null);
  const [related, setRelated] = useState({ projects: [], achievements: [], experience: [], partners: [], news: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBySlug('Project', slug).then(async (p) => {
      setProject(p);
      if (p) {
        const [projects, achievements, experience, partners, news] = await Promise.all([
          fetchByIds('Project', p.project_ids || []),
          fetchByIds('Achievement', p.achievement_ids || []),
          fetchByIds('Experience', p.experience_ids || []),
          fetchByIds('Partner', p.partner_ids || []),
          fetchByIds('Post', p.post_ids || []),
        ]);
        setRelated({ projects, achievements, experience, partners, news });
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="px-5 md:px-10 py-32 text-center text-neutral-400">…</div>;
  if (!project) return <div className="px-5 md:px-10 py-32 text-center text-neutral-400">Not found.</div>;

  const gallery = project.gallery || [];

  return (
    <div>
      <div className="px-5 md:px-10 pt-10">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> {t('site.backToAll')}
        </Link>
      </div>

      <header className="px-5 md:px-10 pt-10 pb-12">
        <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[10vw] md:text-[6vw] lg:text-[5.5rem] max-w-[12ch]">
          {tr(project, 'title')}
        </h1>
        {project.excerpt_en && <p className="mt-6 text-lg text-neutral-600 max-w-2xl">{tr(project, 'excerpt')}</p>}
      </header>

      {project.cover_image && (
        <div className="px-5 md:px-10">
          <div className="rounded-3xl overflow-hidden bg-neutral-100 aspect-[16/9]">
            <Image src={project.cover_image} fittingType="fill" className="w-full h-full" />
          </div>
        </div>
      )}

      <div className="px-5 md:px-10 py-16 grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
        <div>
          {project.date && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Year</p>
              <p className="mt-1">{project.date ? new Date(project.date).getFullYear() : ''}</p>
            </div>
          )}
          {related.partners.length > 0 && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 mb-2">{t('site.partners')}</p>
              <ul className="space-y-1">
                {related.partners.map((pa) => (
                  <li key={pa.id}>{pa.website ? <a href={pa.website} target="_blank" rel="noreferrer" className="hover:underline">{tr(pa, 'name')}</a> : tr(pa, 'name')}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <RichContent html={tr(project, 'story')} className="text-lg leading-relaxed text-neutral-700" />
        </div>
      </div>

      {gallery.length > 0 && (
        <div className="px-5 md:px-10 pb-16 grid gap-4 md:grid-cols-2">
          {gallery.map((g, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-neutral-100">
              <Image src={g} fittingType="fill" className="w-full h-full" />
            </div>
          ))}
        </div>
      )}

      {(project.videos || []).length > 0 && (
        <div className="px-5 md:px-10 pb-16 grid gap-4">
          {project.videos.map((v, i) => (
            <video key={i} src={v} controls className="w-full rounded-2xl bg-black" />
          ))}
        </div>
      )}

      {related.achievements.length > 0 && (
        <section className="px-5 md:px-10 py-12 border-t border-neutral-200">
          <h2 className="font-display text-2xl tracking-tight mb-6">Achievements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {related.achievements.map((a) => (
              <div key={a.id} className="p-6 rounded-2xl border border-neutral-200">
                {a.metric && <p className="font-display text-3xl tracking-tight">{a.metric}</p>}
                <h3 className="font-medium mt-2">{tr(a, 'title')}</h3>
                <RichContent html={tr(a, 'description')} className="text-sm text-neutral-600 mt-2" />
              </div>
            ))}
          </div>
        </section>
      )}

      {related.projects.length > 0 && (
        <section className="px-5 md:px-10 py-12 border-t border-neutral-200">
          <h2 className="font-display text-2xl tracking-tight mb-6">{t('site.relatedProjects')}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.slug}`} className="group">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
                  {p.cover_image && <Image src={p.cover_image} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" />}
                </div>
                <h3 className="font-display text-lg tracking-tight mt-3">{tr(p, 'title')}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {related.news.length > 0 && (
        <section className="px-5 md:px-10 py-12 border-t border-neutral-200">
          <h2 className="font-display text-2xl tracking-tight mb-6">{t('site.relatedNews')}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.news.map((p) => (
              <Link key={p.id} to={`/news/${p.slug}`} className="group">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">{p.published_date ? new Date(p.published_date).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB') : ''}</p>
                <h3 className="font-display text-lg tracking-tight mt-2 group-hover:underline">{tr(p, 'title')}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}