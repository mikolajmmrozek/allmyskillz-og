import { ARTIST_NAME } from '@/lib/brand';

// Public canonical origin for the portfolio. Used for canonical URLs, OG tags,
// JSON-LD, sitemap and llms.txt. If a custom domain is connected later, update
// this single constant and everything downstream follows.
export const SITE_URL = 'https://mikolajmrozek.base44.app';

// Resolve any path (relative, absolute, or already-full URL) to an absolute
// public URL rooted at SITE_URL.
export function absUrl(path = '') {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_URL.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
}

// Convert richtext/HTML snippets to plain text for meta descriptions, llms.txt,
// and JSON-LD string fields.
export function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// ---- Schema.org JSON-LD builders (fed by live entity records) ----

export function websiteJsonLd(settings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings?.site_name_en || ARTIST_NAME,
    url: SITE_URL,
    description: settings?.default_seo_description_en || undefined,
  };
}

export function personJsonLd(settings, home) {
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: ARTIST_NAME,
    url: SITE_URL,
    jobTitle: settings?.tagline_en || home?.focus_en || 'Tattoo Artist & Creative Entrepreneur',
  };
  const desc = home?.intro_en ? stripHtml(home.intro_en) : settings?.default_seo_description_en;
  if (desc) obj.description = desc;
  if (home?.hero_poster_url) obj.image = home.hero_poster_url;
  const sameAs = [settings?.instagram, settings?.linkedin, settings?.youtube, settings?.facebook, settings?.tiktok].filter(Boolean);
  if (sameAs.length) obj.sameAs = sameAs;
  if (settings?.email) obj.email = settings.email;
  return obj;
}

export function creativeWorkJsonLd(project, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title_en || project.title_pl,
    description: project.excerpt_en || project.excerpt_pl || (project.story_en ? stripHtml(project.story_en).slice(0, 300) : undefined),
    url: absUrl(path),
    image: project.cover_image || undefined,
    author: { '@type': 'Person', name: ARTIST_NAME, url: SITE_URL },
  };
}

export function articleJsonLd(post, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title_en || post.title_pl,
    description: post.excerpt_en || post.excerpt_pl || undefined,
    image: post.featured_image || undefined,
    url: absUrl(path),
    datePublished: post.published_date || undefined,
    author: { '@type': 'Person', name: ARTIST_NAME, url: SITE_URL },
  };
}

export function productJsonLd(product, path) {
  const offers = {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: product.currency || 'PLN',
    availability: (product.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: absUrl(path),
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title_en || product.title_pl,
    description: product.description_en ? stripHtml(product.description_en) : (product.description_pl ? stripHtml(product.description_pl) : undefined),
    image: product.images?.[0] || undefined,
    url: absUrl(path),
    offers,
  };
}