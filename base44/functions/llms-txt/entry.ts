import { fetchPublicPortfolio, SITE_URL, ARTIST_NAME, stripHtml } from '../../shared/portfolioPublic.ts';

// Public, no-auth endpoint serving a plain-text, LLM-friendly summary of the
// portfolio. Generated live from the same entities the admin edits, so it
// always reflects the current state — no manual maintenance.
// URL: https://mikolajmrozek.base44.app/functions/llms-txt
export default async function (req: Request): Promise<Response> {
  try {
    const d = await fetchPublicPortfolio(req);
    const { settings, home } = d;
    const L: string[] = [];

    L.push(`# ${ARTIST_NAME}`);
    L.push(`> Tattoo artist & creative entrepreneur. Living portfolio — projects, experience, education, skills, awards, workshops and news.`);
    L.push('');
    L.push(`Website: ${SITE_URL}/`);
    L.push(`Machine-readable portfolio (semantic HTML): ${SITE_URL}/portfolio-data`);
    L.push(`Sitemap: ${SITE_URL}/sitemap.xml`);
    L.push('');

    // About / bio
    if (settings || home) {
      L.push('## About');
      if (settings?.tagline_en) L.push(settings.tagline_en);
      if (home?.focus_en) L.push(`Current focus: ${home.focus_en}`);
      if (home?.intro_en) L.push(stripHtml(home.intro_en));
      L.push('');
    }

    // Experience
    if (d.experience.length) {
      L.push('## Experience');
      d.experience.forEach((e) => {
        const end = e.end_year ? String(e.end_year) : 'present';
        const period = `${e.start_year || ''}–${end}`;
        L.push(`- ${e.position_en || ''}${e.company_en ? ' @ ' + e.company_en : ''} (${period})${e.location_en ? ' — ' + e.location_en : ''}`);
        if (e.description_en) L.push(`  ${stripHtml(e.description_en)}`);
      });
      L.push('');
    }

    // Projects
    if (d.projects.length) {
      L.push('## Projects');
      d.projects.forEach((p) => {
        L.push(`### ${p.title_en || p.title_pl || 'Untitled project'}`);
        L.push(`URL: ${SITE_URL}/projects/${p.slug}`);
        if (p.excerpt_en) L.push(p.excerpt_en);
        if (p.story_en) L.push(stripHtml(p.story_en));
        L.push('');
      });
    }

    // Education
    if (d.education.length) {
      L.push('## Education');
      d.education.forEach((e) => {
        const period = `${e.start_year || ''}${e.end_year ? '–' + e.end_year : ''}`;
        L.push(`- ${e.degree_en || ''}${e.school_en ? ', ' + e.school_en : ''} (${period})${e.location_en ? ' — ' + e.location_en : ''}`);
        if (e.description_en) L.push(`  ${stripHtml(e.description_en)}`);
      });
      L.push('');
    }

    // Skills
    if (d.skills.length) {
      L.push('## Skills');
      const byCat = {};
      d.skills.forEach((s) => {
        const c = s.category_en || 'Other';
        (byCat[c] = byCat[c] || []).push(s.name_en + (s.level ? ` (${s.level}/100)` : ''));
      });
      Object.keys(byCat).forEach((c) => L.push(`- ${c}: ${byCat[c].join(', ')}`));
      L.push('');
    }

    // Awards
    if (d.awards.length) {
      L.push('## Awards');
      d.awards.forEach((a) => {
        L.push(`- ${a.title_en || ''}${a.issuer ? ' — ' + a.issuer : ''}${a.date ? ' (' + new Date(a.date).getFullYear() + ')' : ''}`);
        if (a.description_en) L.push(`  ${stripHtml(a.description_en)}`);
      });
      L.push('');
    }

    // Achievements
    if (d.achievements.length) {
      L.push('## Achievements');
      d.achievements.forEach((a) => {
        L.push(`- ${a.title_en || ''}${a.metric ? ' [' + a.metric + ']' : ''}${a.date ? ' (' + new Date(a.date).getFullYear() + ')' : ''}`);
        if (a.description_en) L.push(`  ${stripHtml(a.description_en)}`);
      });
      L.push('');
    }

    // Certificates
    if (d.certificates.length) {
      L.push('## Certificates');
      d.certificates.forEach((c) => {
        L.push(`- ${c.title_en || ''}${c.issuer ? ' — ' + c.issuer : ''}${c.date ? ' (' + new Date(c.date).getFullYear() + ')' : ''}`);
      });
      L.push('');
    }

    // Languages
    if (d.languages.length) {
      L.push('## Languages');
      L.push(d.languages.map((l) => `${l.name_en || ''} (${l.level_en || ''}${l.proficiency ? ', ' + l.proficiency + '%' : ''})`).join('; '));
      L.push('');
    }

    // Workshops / offers
    if (d.offers.length) {
      L.push('## Workshops & Offers');
      d.offers.forEach((o) => {
        L.push(`### ${o.title_en || ''}`);
        L.push(`URL: ${SITE_URL}/offers/${o.slug}`);
        if (o.cta_text_en) L.push(o.cta_text_en);
        if (o.description_en) L.push(stripHtml(o.description_en));
        if (o.price != null) L.push(`Price: ${o.currency || 'PLN'} ${o.price}`);
        L.push('');
      });
    }

    // News
    if (d.posts.length) {
      L.push('## News');
      d.posts.forEach((p) => {
        const date = p.published_date ? new Date(p.published_date).toISOString().slice(0, 10) : '';
        L.push(`- ${p.title_en || ''}${date ? ' (' + date + ')' : ''} — ${SITE_URL}/news/${p.slug}`);
        if (p.excerpt_en) L.push(`  ${p.excerpt_en}`);
      });
      L.push('');
    }

    // Partners
    if (d.partners.length) {
      L.push('## Partners');
      d.partners.forEach((p) => {
        L.push(`- ${p.name_en || ''}${p.website ? ' — ' + p.website : ''}`);
      });
      L.push('');
    }

    // Public links / contact
    L.push('## Public links');
    if (settings?.email) L.push(`- Email: ${settings.email}`);
    if (settings?.phone) L.push(`- Phone: ${settings.phone}`);
    if (settings?.instagram) L.push(`- Instagram: ${settings.instagram}`);
    if (settings?.linkedin) L.push(`- LinkedIn: ${settings.linkedin}`);
    if (settings?.youtube) L.push(`- YouTube: ${settings.youtube}`);
    if (settings?.facebook) L.push(`- Facebook: ${settings.facebook}`);
    if (settings?.tiktok) L.push(`- TikTok: ${settings.tiktok}`);
    L.push('');

    const text = L.join('\n');
    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}