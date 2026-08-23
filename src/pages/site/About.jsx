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
import { ArrowUpRight } from 'lucide-react';

export default function About() {
  const { lang, tr, t } = useLang();
  const { home, settings } = useSite();
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [awards, setAwards] = useState([]);
  const [projectsByExp, setProjectsByExp] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const [exp, edu, sk, cert, lang2, aw, projects] = await Promise.all([
          fetchPublished('Experience', '-start_year', 100),
          fetchPublished('Education', '-start_year', 100),
          fetchPublished('Skill', 'sort_order', 100),
          fetchPublished('Certificate', '-date', 100),
          fetchPublished('Language', 'sort_order', 100),
          fetchPublished('Award', '-date', 100),
          fetchPublished('Project', '-sort_order', 200),
        ]);
        setExperience(exp); setEducation(edu); setSkills(sk);
        setCertificates(cert); setLanguages(lang2); setAwards(aw);
        // Map: experience_id → projects that reference it
        const map = {};
        for (const ex of exp) {
          map[ex.id] = (projects || []).filter((p) =>
            (p.experience_ids || []).includes(ex.id) ||
            (ex.project_ids || []).includes(p.id)
          );
        }
        setProjectsByExp(map);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const period = (it) => `${it.start_year || ''}${it.end_year ? ' — ' + it.end_year : ' — '}`;

  return (
    <div>
      {/* Story hero */}
      <section className="px-5 md:px-10 pt-20 md:pt-32 pb-16">
        <div className="grid md:grid-cols-12 gap-8 items-end">
          <Reveal className="md:col-span-8">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-500 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent,#CBFF00)]" />
              {t('site.about')}
            </p>
            <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[12vw] md:text-[7vw] lg:text-[7rem] max-w-[14ch]">
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
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">{lang === 'pl' ? 'Obecnie' : 'Currently'}</p>
              <p className="font-display text-xl md:text-2xl tracking-tight">{tr(home, 'focus')}</p>
            </div>
          </Reveal>
        )}
      </section>

      {/* Experience */}
      {experience.length > 0 && (
        <section className="px-5 md:px-10 py-20 md:py-28 border-t border-neutral-200">
          <Reveal className="mb-10">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400 mb-3">{lang === 'pl' ? 'Droga' : 'Journey'}</p>
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">{lang === 'pl' ? 'Doświadczenie' : 'Experience'}</h2>
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
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 mb-3">{lang === 'pl' ? 'Projekty' : 'Projects'}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {(projectsByExp[it.id] || []).map((p) => (
                          <Link key={p.id} to={`/projects/${p.slug}`} className="group rounded-xl overflow-hidden border border-neutral-200 hover:border-black transition">
                            {p.cover_image ? (
                              <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                                <Image src={p.cover_image} fittingType="fill" className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
                              </div>
                            ) : (
                              <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center">
                                <span className="text-xs text-neutral-300">{lang === 'pl' ? 'Brak zdjęcia' : 'No image'}</span>
                              </div>
                            )}
                            <div className="p-2">
                              <p className="text-xs font-medium truncate">{tr(p, 'title')}</p>
                            </div>
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
        <section className="px-5 md:px-10 py-20 md:py-28 border-t border-neutral-200">
          <Reveal className="mb-10">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent,#CBFF00)]" />
              {lang === 'pl' ? 'Kształcenie' : 'Foundation'}
            </p>
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">{lang === 'pl' ? 'Edukacja' : 'Education'}</h2>
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
                          {lang === 'pl' ? 'Załącznik' : 'Attachment'} {i + 1} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </section>
      )}

      {/* Skills + Languages */}
      {(skills.length > 0 || languages.length > 0) && (
        <section className="px-5 md:px-10 py-20 md:py-28 border-t border-neutral-200 grid md:grid-cols-2 gap-12 md:gap-20">
          {skills.length > 0 && (
            <div>
              <Reveal><h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">{lang === 'pl' ? 'Umiejętności' : 'Skills'}</h2></Reveal>
              <div className="space-y-6">
                {skills.map((s, i) => (
                  <Reveal key={s.id} delay={i * 0.05}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{tr(s, 'name')}</span>
                      <span className="text-xs text-neutral-400">{tr(s, 'category')}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                      <motion.div className="h-full bg-[var(--accent,#CBFF00)] rounded-full" style={{ width: `${s.level || 0}%` }} />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
          {languages.length > 0 && (
            <div>
              <Reveal><h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">{lang === 'pl' ? 'Języki' : 'Languages'}</h2></Reveal>
              <div className="grid gap-4 sm:grid-cols-2">
                {languages.map((l, i) => (
                  <Reveal key={l.id} delay={i * 0.05}>
                    <div className="p-6 rounded-2xl border border-neutral-200">
                      <h3 className="font-display text-xl tracking-tight">{tr(l, 'name')}</h3>
                      <p className="text-sm text-neutral-500 mt-1">{tr(l, 'level')}</p>
                      <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden mt-4">
                        <div className="h-full bg-black rounded-full" style={{ width: `${l.proficiency || 0}%` }} />
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Awards + Certificates */}
      {(awards.length > 0 || certificates.length > 0) && (
        <section className="px-5 md:px-10 py-20 md:py-28 border-t border-neutral-200 grid md:grid-cols-2 gap-12 md:gap-20">
          {awards.length > 0 && (
            <div>
              <Reveal><h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">{lang === 'pl' ? 'Nagrody' : 'Awards'}</h2></Reveal>
              <ul className="space-y-4">
                {awards.map((a, i) => (
                  <Reveal key={a.id} delay={i * 0.05}>
                    <li className="pb-4 border-b border-neutral-100">
                      <h3 className="font-medium">{tr(a, 'title')}</h3>
                      <p className="text-sm text-neutral-500">{a.issuer}{a.date ? ' · ' + new Date(a.date).getFullYear() : ''}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          )}
          {certificates.length > 0 && (
            <div>
              <Reveal><h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">{lang === 'pl' ? 'Certyfikaty' : 'Certificates'}</h2></Reveal>
              <ul className="space-y-4">
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
            </div>
          )}
        </section>
      )}

      {/* CTA */}
      <section className="px-5 md:px-10 py-20 md:py-28">
        <Link to="/projects" className="group block">
          <p className="text-xs uppercase tracking-[0.24em] text-neutral-400 mb-3">{t('site.projects')}</p>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-4xl md:text-6xl tracking-tight max-w-[14ch]">{lang === 'pl' ? 'Zobacz wybrane prace' : 'Explore the work'}</h2>
            <ArrowUpRight className="w-10 h-10 text-neutral-400 group-hover:text-black transition shrink-0" />
          </div>
        </Link>
      </section>
    </div>
  );
}