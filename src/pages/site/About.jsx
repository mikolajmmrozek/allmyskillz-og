import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n';
import { useSite } from '@/components/site/SiteProvider';
import { fetchPublished } from '@/lib/siteData';
import RichContent from '@/components/site/RichContent';
import { Briefcase, GraduationCap, Wrench, ScrollText, Languages, Award } from 'lucide-react';

function Timeline({ items, title, icon: Icon, render }) {
  const { t } = useLang();
  if (!items.length) return null;
  return (
    <section className="px-5 md:px-10 py-16">
      <div className="flex items-center gap-3 mb-8">
        <Icon className="w-5 h-5 text-neutral-400" />
        <h2 className="font-display text-2xl md:text-3xl tracking-tight">{title}</h2>
      </div>
      <div className="space-y-0">
        {items.map((it, i) => (
          <div key={it.id} className="grid md:grid-cols-[160px_1fr] gap-2 md:gap-8 py-6 border-t border-neutral-200 first:border-t-0">
            <p className="text-sm text-neutral-400 tabular-nums">
              {render.period ? render.period(it) : ''}
            </p>
            <div>
              <h3 className="font-display text-xl tracking-tight">{render.title(it)}</h3>
              <p className="text-sm text-neutral-500 mt-1">{render.subtitle(it)}</p>
              {render.body(it) && <RichContent html={render.body(it)} className="text-sm text-neutral-600 mt-3 max-w-2xl" />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function About() {
  const { lang, tr, t } = useLang();
  const { home, settings } = useSite();
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [exp, edu, sk, cert, lang2, aw] = await Promise.all([
          fetchPublished('Experience', '-start_year', 100),
          fetchPublished('Education', '-start_year', 100),
          fetchPublished('Skill', 'sort_order', 100),
          fetchPublished('Certificate', '-date', 100),
          fetchPublished('Language', 'sort_order', 100),
          fetchPublished('Award', '-date', 100),
        ]);
        setExperience(exp);
        setEducation(edu);
        setSkills(sk);
        setCertificates(cert);
        setLanguages(lang2);
        setAwards(aw);
      } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <div>
      <section className="px-5 md:px-10 pt-16 md:pt-28 pb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-6">{t('site.about')}</p>
        <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[10vw] md:text-[6vw] lg:text-[6rem] max-w-[14ch]">
          {tr(settings, 'tagline') || tr(home, 'headline') || 'About'}
        </h1>
        {home && <RichContent html={tr(home, 'intro')} className="mt-10 text-lg text-neutral-600 leading-relaxed max-w-2xl" />}
      </section>

      <Timeline
        title={t('site.about') + ' — experience'}
        icon={Briefcase}
        items={experience}
        render={{
          period: (it) => `${it.start_year || ''}${it.end_year ? ' — ' + it.end_year : ' — '}`,
          title: (it) => tr(it, 'position'),
          subtitle: (it) => `${tr(it, 'company')}${it.location_en ? ' · ' + tr(it, 'location') : ''}`,
          body: (it) => tr(it, 'description'),
        }}
      />

      <Timeline
        title={t('site.about') + ' — education'}
        icon={GraduationCap}
        items={education}
        render={{
          period: (it) => `${it.start_year || ''}${it.end_year ? ' — ' + it.end_year : ' — '}`,
          title: (it) => tr(it, 'degree'),
          subtitle: (it) => `${tr(it, 'school')}${it.location_en ? ' · ' + tr(it, 'location') : ''}`,
          body: (it) => tr(it, 'description'),
        }}
      />

      {skills.length > 0 && (
        <section className="px-5 md:px-10 py-16">
          <div className="flex items-center gap-3 mb-8">
            <Wrench className="w-5 h-5 text-neutral-400" />
            <h2 className="font-display text-2xl md:text-3xl tracking-tight">Skills</h2>
          </div>
          <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            {skills.map((s) => (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{tr(s, 'name')}</span>
                  <span className="text-xs text-neutral-400">{tr(s, 'category')}</span>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                  <div className="h-full bg-[var(--accent,#CBFF00)]" style={{ width: `${s.level || 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {languages.length > 0 && (
        <section className="px-5 md:px-10 py-16">
          <div className="flex items-center gap-3 mb-8">
            <Languages className="w-5 h-5 text-neutral-400" />
            <h2 className="font-display text-2xl md:text-3xl tracking-tight">Languages</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {languages.map((l) => (
              <div key={l.id} className="p-6 rounded-2xl border border-neutral-200">
                <h3 className="font-display text-xl tracking-tight">{tr(l, 'name')}</h3>
                <p className="text-sm text-neutral-500 mt-1">{tr(l, 'level')}</p>
                <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden mt-4">
                  <div className="h-full bg-black" style={{ width: `${l.proficiency || 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(awards.length > 0 || certificates.length > 0) && (
        <section className="px-5 md:px-10 py-16 grid md:grid-cols-2 gap-12">
          {awards.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-5 h-5 text-neutral-400" />
                <h2 className="font-display text-2xl tracking-tight">Awards</h2>
              </div>
              <ul className="space-y-4">
                {awards.map((a) => (
                  <li key={a.id} className="pb-4 border-b border-neutral-100">
                    <h3 className="font-medium">{tr(a, 'title')}</h3>
                    <p className="text-sm text-neutral-500">{a.issuer}{a.date ? ' · ' + new Date(a.date).getFullYear() : ''}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {certificates.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <ScrollText className="w-5 h-5 text-neutral-400" />
                <h2 className="font-display text-2xl tracking-tight">Certificates</h2>
              </div>
              <ul className="space-y-4">
                {certificates.map((c) => (
                  <li key={c.id} className="pb-4 border-b border-neutral-100">
                    <h3 className="font-medium">{tr(c, 'title')}</h3>
                    <p className="text-sm text-neutral-500">{c.issuer}{c.date ? ' · ' + new Date(c.date).getFullYear() : ''}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}