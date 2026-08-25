import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { useSite } from '@/components/site/SiteProvider';
import { fetchPublished } from '@/lib/siteData';
import RichContent from '@/components/site/RichContent';
import { ARTIST_NAME } from '@/lib/brand';
import { SITE_URL, stripHtml, personJsonLd, websiteJsonLd } from '@/lib/seo';
import { useSEO } from '@/hooks/use-seo';
import { Loader2 } from 'lucide-react';

// Public, crawlable, semantic-HTML dump of the entire portfolio for search
// engines and AI tools. Generated live from the same entities the admin edits
// — no manual maintenance. Not linked in main navigation, but reachable and
// referenced from /functions/llms-txt and the sitemap. PL primary.
export default function PortfolioData() {
  const { lang, tr } = useLang();
  const { home, settings } = useSite();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: `${ARTIST_NAME} — Portfolio Data`,
    description: 'Machine-readable, semantic summary of the full portfolio: projects, experience, education, skills, awards, workshops and news.',
    canonical: `${SITE_URL}/portfolio-data`,
    jsonLd: [websiteJsonLd(settings), personJsonLd(settings, home)],
  });

  useEffect(() => {
    (async () => {
      try {
        const [experience, education, skills, projects, achievements, awards, certificates, languages, offers, posts, partners] = await Promise.all([
          fetchPublished('Experience', 'sort_order', 200),
          fetchPublished('Education', 'sort_order', 200),
          fetchPublished('Skill', 'sort_order', 200),
          fetchPublished('Project', '-sort_order', 200),
          fetchPublished('Achievement', 'sort_order', 200),
          fetchPublished('Award', 'sort_order', 200),
          fetchPublished('Certificate', 'sort_order', 200),
          fetchPublished('Language', 'sort_order', 200),
          fetchPublished('Offer', 'sort_order', 200),
          fetchPublished('Post', '-published_date', 200),
          fetchPublished('Partner', 'sort_order', 200),
        ]);
        setData({ experience, education, skills, projects, achievements, awards, certificates, languages, offers, posts, partners });
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  if (loading || !data) {
    return <div className="px-5 md:px-10 py-32 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;
  }

  const f = (k) => (lang === 'pl' ? k + '_pl' : k + '_en');
  const fld = (obj, base) => obj?.[f(base)] || obj?.[base + '_en'] || obj?.[base + '_pl'] || '';
  const period = (start, end) => `${start || ''}${end ? (end === 0 ? '–obecnie' : '–' + end) : (start ? '–obecnie' : '')}`;

  return (
    <div className="px-5 md:px-10 py-16 max-w-3xl mx-auto text-neutral-800">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">Portfolio data · for crawlers & AI</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">{ARTIST_NAME}</h1>
        <p className="mt-2 text-neutral-600">{fld(settings, 'tagline') || 'Tattoo Artist & Creative Entrepreneur'}</p>
        {fld(home, 'intro') && <div className="mt-4 text-neutral-700"><RichContent html={fld(home, 'intro')} /></div>}
        {fld(home, 'focus') && <p className="mt-3 text-sm text-neutral-500">{lang === 'pl' ? 'Aktualny kierunek:' : 'Current focus:'} {fld(home, 'focus')}</p>}
      </header>

      {data.experience.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl tracking-tight mb-4">{lang === 'pl' ? 'Doświadczenie' : 'Experience'}</h2>
          {data.experience.map((e) => (
            <article key={e.id} className="mb-5">
              <h3 className="font-medium">{fld(e, 'position')}{fld(e, 'company') ? ` — ${fld(e, 'company')}` : ''}</h3>
              <p className="text-sm text-neutral-500">{period(e.start_year, e.end_year)}{fld(e, 'location') ? ` · ${fld(e, 'location')}` : ''}</p>
              {fld(e, 'description') && <div className="mt-2 text-sm text-neutral-700"><RichContent html={fld(e, 'description')} /></div>}
            </article>
          ))}
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl tracking-tight mb-4">{lang === 'pl' ? 'Projekty' : 'Projects'}</h2>
          {data.projects.map((p) => (
            <article key={p.id} className="mb-6">
              <h3 className="font-medium"><Link to={`/projects/${p.slug}`} className="underline underline-offset-2">{fld(p, 'title')}</Link></h3>
              <p className="text-xs text-neutral-400 mt-1">{SITE_URL}/projects/{p.slug}</p>
              {fld(p, 'excerpt') && <p className="mt-2 text-sm text-neutral-600">{fld(p, 'excerpt')}</p>}
              {fld(p, 'story') && <div className="mt-2 text-sm text-neutral-700"><RichContent html={fld(p, 'story')} /></div>}
            </article>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl tracking-tight mb-4">{lang === 'pl' ? 'Edukacja' : 'Education'}</h2>
          {data.education.map((e) => (
            <article key={e.id} className="mb-4">
              <h3 className="font-medium">{fld(e, 'degree')}{fld(e, 'school') ? ` — ${fld(e, 'school')}` : ''}</h3>
              <p className="text-sm text-neutral-500">{period(e.start_year, e.end_year)}{fld(e, 'location') ? ` · ${fld(e, 'location')}` : ''}</p>
              {fld(e, 'description') && <div className="mt-2 text-sm text-neutral-700"><RichContent html={fld(e, 'description')} /></div>}
            </article>
          ))}
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl tracking-tight mb-4">{lang === 'pl' ? 'Umiejętności' : 'Skills'}</h2>
          <ul className="space-y-1 text-sm">
            {data.skills.map((s) => (
              <li key={s.id}>{fld(s, 'name')}{s.level ? ` — ${s.level}/100` : ''}{fld(s, 'category') ? ` (${fld(s, 'category')})` : ''}</li>
            ))}
          </ul>
        </section>
      )}

      {data.awards.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl tracking-tight mb-4">{lang === 'pl' ? 'Nagrody' : 'Awards'}</h2>
          {data.awards.map((a) => (
            <article key={a.id} className="mb-4">
              <h3 className="font-medium">{fld(a, 'title')}</h3>
              <p className="text-sm text-neutral-500">{a.issuer}{a.date ? ` · ${new Date(a.date).getFullYear()}` : ''}</p>
              {fld(a, 'description') && <div className="mt-2 text-sm text-neutral-700"><RichContent html={fld(a, 'description')} /></div>}
            </article>
          ))}
        </section>
      )}

      {data.achievements.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl tracking-tight mb-4">{lang === 'pl' ? 'Osiągnięcia' : 'Achievements'}</h2>
          {data.achievements.map((a) => (
            <article key={a.id} className="mb-4">
              <h3 className="font-medium">{fld(a, 'title')}{a.metric ? ` — ${a.metric}` : ''}</h3>
              {a.date && <p className="text-sm text-neutral-500">{new Date(a.date).getFullYear()}</p>}
              {fld(a, 'description') && <div className="mt-2 text-sm text-neutral-700"><RichContent html={fld(a, 'description')} /></div>}
            </article>
          ))}
        </section>
      )}

      {data.certificates.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl tracking-tight mb-4">{lang === 'pl' ? 'Certyfikaty' : 'Certificates'}</h2>
          <ul className="space-y-1 text-sm">
            {data.certificates.map((c) => (
              <li key={c.id}>{fld(c, 'title')}{c.issuer ? ` — ${c.issuer}` : ''}{c.date ? ` (${new Date(c.date).getFullYear()})` : ''}</li>
            ))}
          </ul>
        </section>
      )}

      {data.languages.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl tracking-tight mb-4">{lang === 'pl' ? 'Języki' : 'Languages'}</h2>
          <ul className="space-y-1 text-sm">
            {data.languages.map((l) => (
              <li key={l.id}>{fld(l, 'name')} — {fld(l, 'level')}{l.proficiency ? ` (${l.proficiency}%)` : ''}</li>
            ))}
          </ul>
        </section>
      )}

      {data.offers.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl tracking-tight mb-4">{lang === 'pl' ? 'Warsztaty i oferty' : 'Workshops & Offers'}</h2>
          {data.offers.map((o) => (
            <article key={o.id} className="mb-5">
              <h3 className="font-medium"><Link to={`/offers/${o.slug}`} className="underline underline-offset-2">{fld(o, 'title')}</Link></h3>
              <p className="text-xs text-neutral-400 mt-1">{SITE_URL}/offers/{o.slug}</p>
              {fld(o, 'description') && <div className="mt-2 text-sm text-neutral-700"><RichContent html={fld(o, 'description')} /></div>}
              {o.price != null && <p className="mt-2 text-sm text-neutral-500">{o.currency || 'PLN'} {o.price}</p>}
            </article>
          ))}
        </section>
      )}

      {data.posts.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl tracking-tight mb-4">{lang === 'pl' ? 'Aktualności' : 'News'}</h2>
          {data.posts.map((p) => (
            <article key={p.id} className="mb-4">
              <h3 className="font-medium"><Link to={`/news/${p.slug}`} className="underline underline-offset-2">{fld(p, 'title')}</Link></h3>
              <p className="text-xs text-neutral-400 mt-1">{SITE_URL}/news/{p.slug}{p.published_date ? ` · ${new Date(p.published_date).toISOString().slice(0, 10)}` : ''}</p>
              {fld(p, 'excerpt') && <p className="mt-1 text-sm text-neutral-600">{fld(p, 'excerpt')}</p>}
            </article>
          ))}
        </section>
      )}

      {data.partners.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl tracking-tight mb-4">{lang === 'pl' ? 'Partnerzy' : 'Partners'}</h2>
          <ul className="space-y-1 text-sm">
            {data.partners.map((p) => (
              <li key={p.id}>{fld(p, 'name')}{p.website ? ` — ${p.website}` : ''}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-12">
        <h2 className="font-display text-2xl tracking-tight mb-4">{lang === 'pl' ? 'Linki i kontakt' : 'Public links'}</h2>
        <ul className="space-y-1 text-sm">
          {settings?.email && <li>Email: <a href={`mailto:${settings.email}`} className="underline">{settings.email}</a></li>}
          {settings?.phone && <li>Phone: {settings.phone}</li>}
          {settings?.instagram && <li>Instagram: {settings.instagram}</li>}
          {settings?.linkedin && <li>LinkedIn: {settings.linkedin}</li>}
          {settings?.youtube && <li>YouTube: {settings.youtube}</li>}
          {settings?.facebook && <li>Facebook: {settings.facebook}</li>}
          {settings?.tiktok && <li>TikTok: {settings.tiktok}</li>}
        </ul>
      </section>
    </div>
  );
}