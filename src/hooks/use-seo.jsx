import { useEffect } from 'react';

// Sets document title + meta description + Open Graph / Twitter tags from
// the given values. Restores the previous title on unmount. Pass falsy values
// to leave a tag untouched; pass a string to set/update it.
export function useSEO({ title, description, image, url } = {}) {
  useEffect(() => {
    const prevTitle = document.title;

    if (title) {
      document.title = title;
    }

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
      return isNew ? { el, selector } : null;
    };

    const created = [];
    created.push(upsertMeta('meta[name="description"]', 'name', description));
    created.push(upsertMeta('meta[property="og:title"]', 'property', title));
    created.push(upsertMeta('meta[property="og:description"]', 'property', description));
    created.push(upsertMeta('meta[property="og:type"]', 'property', 'article'));
    created.push(upsertMeta('meta[property="og:image"]', 'property', image));
    created.push(upsertMeta('meta[name="twitter:card"]', 'name', image ? 'summary_large_image' : 'summary'));
    created.push(upsertMeta('meta[name="twitter:title"]', 'name', title));
    created.push(upsertMeta('meta[name="twitter:description"]', 'name', description));
    created.push(upsertMeta('meta[name="twitter:image"]', 'name', image));
    if (url) {
      created.push(upsertMeta('meta[property="og:url"]', 'property', url));
    }

    return () => {
      document.title = prevTitle;
      created.forEach((entry) => {
        if (entry && entry.el && entry.el.parentNode) {
          entry.el.parentNode.removeChild(entry.el);
        }
      });
    };
  }, [title, description, image, url]);
}