import { useLayoutEffect } from 'react';
import { SITE_URL } from '@/lib/seo';

// Sets document title + meta description + Open Graph / Twitter tags, a
// canonical <link>, the <html lang>, a robots meta, and JSON-LD structured
// data <script> blocks from the given values. Everything created is removed on
// unmount; pre-existing static tags (e.g. in index.html) are updated in place
// but never removed. Pass falsy values to leave a tag untouched.
//
// Base44 prerenders each page for crawlers, so these client-injected tags are
// captured automatically — no SSR needed.
export function useSEO({ title, description, image, url, canonical, lang = 'pl', robots = 'index,follow', jsonLd, type = 'website', replaceDefaults = false } = {}) {
  // useLayoutEffect (not useEffect) so tags are written to <head> synchronously
  // at commit time, before the browser paints — which is also before the
  // platform prerenderer snapshots the page. This makes per-entity og:image /
  // title land in the captured HTML instead of arriving a frame too late.
  useLayoutEffect(() => {
    const prevTitle = document.title;
    if (replaceDefaults) {
      [...document.head.querySelectorAll('title')].slice(1).forEach((el) => el.remove());
      // Dimensions of the static site image do not describe a project's cover.
      document.head.querySelectorAll('meta[property="og:image:width"], meta[property="og:image:height"]').forEach((el) => el.remove());
    }
    if (title) document.title = title;
    if (lang) document.documentElement.lang = lang;

    const created = [];

    // attrValue is the real meta name/property (e.g. 'og:image'); setting it on
    // create (not '') is what makes the tag visible to crawlers.
    const upsertMeta = (selector, attr, attrValue, content, extraAttrs = {}) => {
      if (!content && !replaceDefaults) return null;
      const matches = [...document.head.querySelectorAll(selector)];
      let el = matches[0];
      if (replaceDefaults) matches.slice(1).forEach((duplicate) => duplicate.remove());
      const isNew = !el;
      if (isNew) {
        el = document.createElement('meta');
        el.setAttribute(attr, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', String(content ?? ''));
      for (const [k, v] of Object.entries(extraAttrs)) el.setAttribute(k, v);
      return isNew ? { el } : null;
    };

    created.push(upsertMeta('meta[name="description"]', 'name', 'description', description));
    created.push(upsertMeta('meta[property="og:title"]', 'property', 'og:title', title));
    created.push(upsertMeta('meta[property="og:description"]', 'property', 'og:description', description));
    created.push(upsertMeta('meta[property="og:type"]', 'property', 'og:type', type));
    created.push(upsertMeta('meta[property="og:image"]', 'property', 'og:image', image));
    created.push(upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical || url));
    created.push(upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', image ? 'summary_large_image' : 'summary'));
    created.push(upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title));
    created.push(upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description));
    created.push(upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image));
    created.push(upsertMeta('meta[name="robots"]', 'name', 'robots', robots));

    // Canonical link — derive from SITE_URL + current path if not provided.
    const canonicalHref = canonical || url || (SITE_URL + window.location.pathname + window.location.search);
    if (canonicalHref) {
      const links = [...document.head.querySelectorAll('link[rel="canonical"]')];
      let link = links[0];
      if (replaceDefaults) links.slice(1).forEach((duplicate) => duplicate.remove());
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
  }, [title, description, image, url, canonical, lang, robots, type, replaceDefaults, JSON.stringify(jsonLd)]);
}