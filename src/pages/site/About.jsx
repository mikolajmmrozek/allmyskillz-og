import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/i18n';
import { useSite } from '@/components/site/SiteProvider';
import { fetchPublished } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import RichContent from '@/components/site/RichContent';
import { Reveal } from '@/components/site/Motion';
import Timeline from '@/components/site/Timeline';
import VideoEmbed from '@/components/site/VideoEmbed';
import AwardGallery from '@/components/site/AwardGallery';
import { ArrowUpRight } from 'lucide-react';
import SectionNav from '@/components/site/SectionNav';
import { useSEO } from '@/hooks/use-seo';
import { personJsonLd, websiteJsonLd } from '@/lib/seo';
import { ARTIST_NAME } from '@/lib/brand';

export default function About() {
  const { lang, tr, t } = useLang();
  const { home, settings } = useSite();
  useSEO({
    title: `${ARTIST_NAME} — ${lang === 'pl' ? 'O mnie' : 'About'}`,
    description: settings?.default_seo_description_en || undefined,
    jsonLd: [websiteJsonLd(settings), personJsonLd(settings, home)],
  });
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [awards, setAwards] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [projectsByExp, setProjectsByExp] = useState({});
  const [postsByExp, setPostsByExp] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const [exp, edu, sk, cert, lang2, aw, ach, projects, posts] = await Promise.all([
          fetchPublished('Experience', '-start_year', 100),
          fetchPublished('Education', '-start_year', 100),
          fetchPublished('Skill', 'sort_order', 100),
          fetchPublished('Certificate', '-date', 100),
          fetchPublished('Language', 'sort_order', 100),
          fetchPublished('Award', '-date', 100),
          fetchPublished('Achievement', '-date', 100),
          fetchPublished('Project', '-sort_order', 200),
          fetchPublished('Post', '-published_date', 100),
        ]);
        setExperience(exp); setEducation(edu); setSkills(sk);
        setCertificates(cert); setLanguages(lang2); setAwards(aw);
        setAchievements(ach);
        // Map: experience_id → projects that reference it
        const map = {};
        for (const ex of exp) {
          map[ex.id] = (projects || []).filter((p) =>
            (p.experience_ids || []).includes(ex.id) ||
            (ex.project_ids || []).includes(p.id)
          );
        }
        setProjectsByExp(map);
        // Map: experience/education_id → posts that reference it
        const pmap = {};
        for (const it of [...exp, ...edu]) {
          pmap[it.id] = (posts || []).filter((p) => (it.post_ids || []).includes(p.id));
        }
        setPostsByExp(pmap);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const MONTHS = lang === 'pl'
    ? ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = (year, month) => {
    if (!year && !month) return '';
    if (month && year) return `${MONTHS[month - 1]} ${year}`;
    return `${year || ''}`;
  };
  const period = (it) => {
    const start = fmt(it.start_year, it.start_month);
    const ongoing = !it.end_year || it.end_year === 0;
    const end = ongoing ? (lang === 'pl' ? 'obecnie' : 'present') : fmt(it.end_year, it.end_month);
    return `${start} — ${end}`;
  };

  const skillGroups = Object.entries(
    skills.reduce((acc, s) => {
      const cat = tr(s, 'category') || (lang === 'pl' ? 'Inne' : 'Other');
      (acc[cat] = acc[cat] || []).push(s);
      return acc;
    }, {})
  );

  const navSections = [
    experience.length > 0 && { id: 'experience', label: t('about.experience') },
    education.length > 0 && { id: 'education', label: t('about.education') },
    languages.length > 0 && { id: 'languages', label: t('about.languages') },
    skills.length > 0 && { id: 'skills', label: t('about.skills') },
    achievements.length > 0 && { id: 'achievements', label: t('about.achievements') },
    awards.length > 0 && { id: 'awards', label: t('about.awards') },
    certificates.length > 0 && { id: 'certificates', label: t('about.certificates') },
  ].filter(Boolean);

  return (
    <div>
      <SectionNav sections={navSections} />
      {/* Story hero */}
      <section className="px-5 md:px-10 pt-20 md:pt-32 pb-16">
        <div className="grid md:grid-cols-12 gap-8 items-end">
          <Reveal className="md:col-span-8">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-500 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent,#CBFF00)]" />
              {t('site.about')}
            </p>
            <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[8.5vw] md:text-[7vw] lg:text-[7rem] max-w-[18ch]">
              {tr(settings, 'tagline') || tr(home, 'headline') || 'About'}
            </h1>
          </Reveal>
        </div>
        {home && (
          <Reveal delay={0.15} className="mt-10 max-w-2xl">
            <RichContent html={tr(home, 'intro')} className="text-lg text-neutral-600 leading-relaxed" />
          </Reveal>
        )}
        {tr(home, 'focus') && (
          <Reveal delay={0.25} className="mt-12 flex items-start gap-4 max-w-2xl">
            <span className="mt-2 w-10 h-px bg-[var(--accent,#CBFF00)] shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">{t('about.currently')}</p>
              <p className="font-display text-xl md:text-2xl tracking-tight">{tr(home, 'focus')}</p>
            </div>
          </Reveal>
        )}
      </section>

      {/* Experience */}
      {experience.length > 0 && (
        <section id="experience" className="px-5 md:px-10 py-20 md:py-28 border-t border-neutral-200 scroll-mt-20">
          <Reveal className="mb-10">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400 mb-3">{t('about.journey')}</p>
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">{t('about.experience')}</h2>
          </Reveal>
          <Timeline
            items={experience}
            render={{
              period,
              title: (it) => tr(it, 'position'),
              subtitle: (it) => `${tr(it, 'company')}${tr(it, 'location') ? ' · ' + tr(it, 'location') : ''}`,
              body: (it) => tr(it, 'description'),
              media: (it) => (
                <div className="mt-5 space-y-4">
                  {(it.videos || []).map((v, i) => (
                    <VideoEmbed key={i} url={v} />
                  ))}
                  {(it.gallery || []).length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {it.gallery.map((g, i) => (
                        <div key={i} className="rounded-xl overflow-hidden bg-neutral-100">
                          <Image src={g} fittingType="fill" className="w-full h-full aspect-[4/3]" />
                        </div>
                      ))}
                    </div>
                  )}
                  {(projectsByExp[it.id] || []).length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 mb-3">{t('about.projects')}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {(projectsByExp[it.id] || []).map((p) => (
                          <Link key={p.id} to={`/projects/${p.slug}`} className={`group rounded-xl overflow-hidden border transition ${p.cover_image ? 'border-neutral-200 bg-white hover:border-black' : 'border-black/10 bg-[var(--accent,#CBFF00)] hover:border-black'}`}>
                            {p.cover_image ? (
                              <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                                <Image src={p.cover_image} fittingType="fill" className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
                              </div>
                            ) : (
                              <div className="aspect-[4/3] bg-[var(--accent,#CBFF00)] flex items-center justify-center p-3">
                                <span className="text-xs font-semibold text-black text-center line-clamp-3">{tr(p, 'title')}</span>
                              </div>
                            )}
                            {p.cover_image && (
                              <div className="p-2">
                                <p className="text-xs font-medium truncate">{tr(p, 'title')}</p>
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {(postsByExp[it.id] || []).length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 mb-3">{t('about.news')}</p>
                      <div className="space-y-2">
                        {(postsByExp[it.id] || []).map((p) => (
                          <Link key={p.id} to={`/news/${p.slug}`} className="group block text-sm hover:underline">
                            <span className="font-medium">{tr(p, 'title')}</span>
                            {p.published_date && <span className="text-neutral-400 ml-2">· {new Date(p.published_date).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section id="education" className="px-5 md:px-10 py-20 md:py-28 border-t border-neutral-200 scroll-mt-20">
          <Reveal className="mb-10">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent,#CBFF00)]" />
              {t('about.foundation')}
            </p>
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">{t('about.education')}</h2>
          </Reveal>
          <Timeline
            items={education}
            render={{
              period,
              title: (it) => tr(it, 'degree'),
              subtitle: (it) => `${tr(it, 'school')}${tr(it, 'location') ? ' · ' + tr(it, 'location') : ''}`,
              body: (it) => tr(it, 'description'),
              media: (it) => (
                <div className="mt-5 space-y-4">
                  {it.background_image && (
                    <div className="rounded-xl overflow-hidden bg-neutral-100">
                      <Image src={it.background_image} fittingType="fill" className="w-full aspect-[16/9]" />
                    </div>
                  )}
                  {(it.gallery || []).length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {it.gallery.map((g, i) => (
                        <div key={i} className="rounded-xl overflow-hidden bg-neutral-100">
                          <Image src={g} fittingType="fill" className="w-full h-full aspect-[4/3]" />
                        </div>
                      ))}
                    </div>
                  )}
                  {(it.attachments || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {it.attachments.map((a, i) => (
                        <a key={i} href={a} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 hover:border-black transition">
                          {t('about.attachment')} {i + 1} ↗
                        </a>
                      ))}
                    </div>
                  )}
                  {(postsByExp[it.id] || []).length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 mb-3">{t('about.news')}</p>
                      <div className="space-y-2">
                        {(postsByExp[it.id] || []).map((p) => (
                          <Link key={p.id} to={`/news/${p.slug}`} className="group block text-sm hover:underline">
                            <span className="font-medium">{tr(p, 'title')}</span>
                            {p.published_date && <span className="text-neutral-400 ml-2">· {new Date(p.published_date).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </section>
      )}

      {/* Languages — single row */}
      {languages.length > 0 && (
        <section id="languages" className="px-5 md:px-10 py-20 md:py-28 border-t border-neutral-200 scroll-mt-20">
          <Reveal className="mb-10">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent,#CBFF00)]" />
              {t('about.languages')}
            </p>
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">{t('about.languages')}</h2>
          </Reveal>
          <div className="flex flex-wrap gap-4">
            {languages.map((l, i) => (
              <Reveal key={l.id} delay={i * 0.05} className="flex-1 min-w-[180px]">
                <div className="p-6 rounded-2xl border border-neutral-200 h-full">
                  <h3 className="font-display text-lg tracking-tight">{tr(l, 'name')}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{tr(l, 'level')}</p>
                  <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden mt-3">
                    <div className="h-full bg-[var(--accent,#CBFF00)] rounded-full" style={{ width: `${l.proficiency || 0}%` }} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Skills — grouped by category, 3 cols desktop / 2 tablet / 1 mobile */}
      {skills.length > 0 && (
        <section id="skills" className="px-5 md:px-10 py-20 md:py-28 border-t border-neutral-200 scroll-mt-20">
          <Reveal className="mb-10">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent,#CBFF00)]" />
              {t('about.skills')}
            </p>
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">{t('about.skills')}</h2>
          </Reveal>
          {skillGroups.map(([cat, items], gi) => (
            <div key={cat} className="mb-12 last:mb-0">
              <Reveal>
                <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-5 pb-2 border-b border-neutral-100">{cat}</h3>
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((s, i) => (
                  <Reveal key={s.id} delay={i * 0.04}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{tr(s, 'name')}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                        <motion.div className="h-full bg-[var(--accent,#CBFF00)] rounded-full" style={{ width: `${s.level || 0}%` }} />
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <section id="achievements" className="px-5 md:px-10 py-20 md:py-28 border-t border-neutral-200 scroll-mt-20">
          <Reveal className="mb-10">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent,#CBFF00)]" />
              {t('about.milestones')}
            </p>
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">{t('about.achievements')}</h2>
          </Reveal>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [&>*]:mb-6">
            {achievements.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.05}>
                <div className="p-6 rounded-2xl bg-[var(--accent,#CBFF00)] text-black break-inside-avoid">
                  {a.metric && <p className="font-display text-4xl tracking-tight">{a.metric}</p>}
                  <h3 className="font-medium mt-2">{tr(a, 'title')}</h3>
                  {tr(a, 'description') && <RichContent html={tr(a, 'description')} className="text-sm text-black/70 mt-2 [&_a]:text-black [&_a]:underline" />}
                  {a.date && <p className="text-xs text-black/50 mt-3 pt-3">{new Date(a.date).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { year: 'numeric', month: 'long' })}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <section id="awards" className="px-5 md:px-10 py-20 md:py-28 border-t border-neutral-200 scroll-mt-20">
          <Reveal><h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">{t('about.awards')}</h2></Reveal>
          <ul className="space-y-4 pl-6 md:pl-10">
            {awards.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.05}>
                <li className="pb-4 border-b border-neutral-100">
                  <h3 className="font-medium">{tr(a, 'title')}</h3>
                  <p className="text-sm text-neutral-500">{a.issuer}{a.date ? ' · ' + new Date(a.date).getFullYear() : ''}</p>
                  <AwardGallery image={a.image} gallery={a.gallery} alt={tr(a, 'title')} />
                </li>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <section id="certificates" className="px-5 md:px-10 py-20 md:py-28 border-t border-neutral-200 scroll-mt-20">
          <Reveal><h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">{t('about.certificates')}</h2></Reveal>
          <ul className="space-y-4 pl-6 md:pl-10">
            {certificates.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.05}>
                <li className="pb-4 border-b border-neutral-100 flex items-start gap-4">
                  {c.image && <Image src={c.image} fittingType="fill" className="w-12 h-12 rounded-lg shrink-0" />}
                  <div>
                    <h3 className="font-medium">{tr(c, 'title')}</h3>
                    <p className="text-sm text-neutral-500">{c.issuer}{c.date ? ' · ' + new Date(c.date).getFullYear() : ''}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* CTA — accent field */}
      <section className="px-5 md:px-10 py-20 md:py-28">
        <Link to="/projects" className="group block relative rounded-3xl bg-[var(--accent,#CBFF00)] p-10 md:p-20 text-center overflow-hidden">
          <div className="mesh-bg absolute inset-0 opacity-50 pointer-events-none" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.24em] text-black/60 mb-3">{t('site.projects')}</p>
            <h2 className="font-display text-4xl md:text-7xl tracking-[-0.02em] max-w-3xl mx-auto text-black">
              {t('about.exploreAll')}
            </h2>
            <span className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-medium group-hover:opacity-90 transition">
              {t('about.viewAll')} <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
}