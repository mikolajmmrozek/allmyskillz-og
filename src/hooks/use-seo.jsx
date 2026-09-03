import { useEffect } from 'react';
import { SITE_URL } from '@/lib/seo';

// Sets document title + meta description + Open Graph / Twitter tags, a
// canonical <link>, the <html lang>, a robots meta, and JSON-LD structured
// data <script> blocks from the given values. Everything created is removed on
// unmount; pre-existing static tags (e.g. in index.html) are updated in place
// but never removed. Pass falsy values to leave a tag untouched.
//
// Base44 prerenders each page for crawlers, so these client-injected tags are
// captured automatically — no SSR needed.
export function useSEO({ title, description, image, url, canonical, lang = 'pl', robots = 'index,follow', jsonLd, type = 'website' } = {}) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;
    if (lang) document.documentElement.lang = lang;

    const created = [];

    const upsertMeta = (selector, attr, content, extraAttrs = {}) => {
      if (!content) return null;
      let el = document.head.querySelector(selector);
      const isNew = !el;
      if (isNew) {
        el = document.createElement('meta');
        el.setAttribute(attr, '');
        document.head.appendChild(el);
      }
      el.setAttribute('content', String(content));
      for (const [k, v] of Object.entries(extraAttrs)) el.setAttribute(k, v);
      return isNew ? { el } : null;
    };

    created.push(upsertMeta('meta[name="description"]', 'name', description));
    created.push(upsertMeta('meta[property="og:title"]', 'property', title));
    created.push(upsertMeta('meta[property="og:description"]', 'property', description));
    created.push(upsertMeta('meta[property="og:type"]', 'property', type));
    created.push(upsertMeta('meta[property="og:image"]', 'property', image));
    created.push(upsertMeta('meta[property="og:url"]', 'property', canonical || url));
    created.push(upsertMeta('meta[name="twitter:card"]', 'name', image ? 'summary_large_image' : 'summary'));
    created.push(upsertMeta('meta[name="twitter:title"]', 'name', title));
    created.push(upsertMeta('meta[name="twitter:description"]', 'name', description));
    created.push(upsertMeta('meta[name="twitter:image"]', 'name', image));
    created.push(upsertMeta('meta[name="robots"]', 'name', robots));

    // Canonical link — derive from SITE_URL + current path if not provided.
    const canonicalHref = canonical || url || (SITE_URL + window.location.pathname + window.location.search);
    if (canonicalHref) {
      let link = document.head.querySelector('link[rel="canonical"]');
      const isNew = !link;
      if (isNew) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalHref);
      if (isNew) created.push({ el: link });
    }

    // JSON-LD structured data — one script per object, cleaned up on unmount.
    const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
    blocks.forEach((obj, i) => {
      if (!obj) return;
      let script = document.head.querySelector(`script[data-seo-jsonld="${i}"]`);
      const isNew = !script;
      if (isNew) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-seo-jsonld', String(i));
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(obj);
      if (isNew) created.push({ el: script });
    });
    // Remove any stale JSON-LD blocks beyond the current count.
    document.head.querySelectorAll('script[data-seo-jsonld]').forEach((s) => {
      const idx = Number(s.getAttribute('data-seo-jsonld'));
      if (idx >= blocks.length) s.parentNode && s.parentNode.removeChild(s);
    });

    return () => {
      document.title = prevTitle;
      created.forEach((entry) => {
        if (entry && entry.el && entry.el.parentNode) {
          entry.el.parentNode.removeChild(entry.el);
        }
      });
    };
  }, [title, description, image, url, canonical, lang, robots, type, JSON.stringify(jsonLd)]);
}