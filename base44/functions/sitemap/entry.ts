import { fetchPublicPortfolio, SITE_URL } from '../../shared/portfolioPublic.ts';

// Public, no-auth dynamic sitemap. Lists every public static route plus
// dynamic detail URLs generated from published records. Served as XML.
// URL: https://mikolajmrozek.base44.app/functions/sitemap
// (Submit this URL to Google Search Console. Base44 also auto-generates
// /sitemap.xml for static routes; this adds the dynamic detail URLs.)
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function (req: Request): Promise<Response> {
  try {
    const d = await fetchPublicPortfolio(req);

    const entries: string[] = [];
    const add = (loc, priority = '0.7', changefreq = 'weekly') => {
      entries.push(
        `  <url>\n    <loc>${esc(loc)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
      );
    };

    // Static public routes
    add(`${SITE_URL}/`, '1.0', 'weekly');
    add(`${SITE_URL}/about`, '0.9', 'monthly');
    add(`${SITE_URL}/projects`, '0.9', 'weekly');
    add(`${SITE_URL}/offers`, '0.9', 'weekly');
    add(`${SITE_URL}/news`, '0.9', 'weekly');
    add(`${SITE_URL}/shop`, '0.9', 'weekly');
    add(`${SITE_URL}/contact`, '0.6', 'monthly');
    add(`${SITE_URL}/portfolio-data`, '0.5', 'weekly');

    // Dynamic detail URLs
    d.projects.forEach((p) => p.slug && add(`${SITE_URL}/projects/${esc(p.slug)}`, '0.8', 'weekly'));
    d.offers.forEach((o) => o.slug && add(`${SITE_URL}/offers/${esc(o.slug)}`, '0.7', 'monthly'));
    d.posts.forEach((p) => p.slug && add(`${SITE_URL}/news/${esc(p.slug)}`, '0.7', 'monthly'));
    d.products.forEach((p) => p.slug && add(`${SITE_URL}/shop/${esc(p.slug)}`, '0.7', 'weekly'));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}