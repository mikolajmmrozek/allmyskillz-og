import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { SiteContext } from './SiteProvider';
import { fetchSite } from '@/lib/siteData';
import { useLang } from '@/lib/i18n';

// Module-level cache so auth/admin pages (outside SiteProvider) share the
// same fetch as the public site and don't refetch on every mount.
let cached = null;
let pending = null;
function loadSettings() {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = fetchSite()
      .then((s) => { cached = s; return s; })
      .catch(() => null);
  }
  return pending;
}

function applyFavicon(url) {
  if (!url || typeof document === 'undefined') return;
  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  if (link.href !== url) link.href = url;
}

// Returns the SiteSetting record regardless of whether a SiteProvider is
// mounted above (public pages have it; auth/admin pages don't).
export function useBranding() {
  const ctx = useContext(SiteContext);
  const [local, setLocal] = useState(cached?.settings || null);
  useEffect(() => {
    if (ctx?.settings) {
      cached = ctx;
      applyFavicon(ctx.settings.favicon_url || ctx.settings.logo_url);
      return;
    }
    loadSettings().then((s) => {
      setLocal(s?.settings || null);
      applyFavicon(s?.settings?.favicon_url || s?.settings?.logo_url);
    });
  }, [ctx]);
  return ctx?.settings || local;
}

// tone: 'natural' = as uploaded, 'dark' = force black silhouette, 'light' = force white silhouette.
const toneFilter = (tone) =>
  tone === 'dark' ? 'brightness(0)'
  : tone === 'light' ? 'brightness(0) invert(1)'
  : null;

// Pure image badge. Transparent background; recolored via CSS filter when a tone is set.
export default function SiteLogo({ size = 36, tone = 'natural', className = '' }) {
  const settings = useBranding();
  const url = settings?.logo_url;
  const filter = toneFilter(tone);
  if (!url) {
    return (
      <span
        style={{ width: size, height: size }}
        className={`rounded-xl bg-neutral-100 ${className}`}
      />
    );
  }
  return (
    <img
      src={url}
      alt={settings?.site_name_en || 'Logo'}
      style={{ height: size, width: 'auto', filter: filter || undefined }}
      className={`object-contain ${className}`}
    />
  );
}

export { SiteLogo };

// Logo + wordmark, language-aware. Used across header/footer/auth/admin.
export function SiteBrand({ to = '/', size = 36, tone = 'dark', nameClassName = '', logoClassName = '', showName = true }) {
  const { lang } = useLang();
  const settings = useBranding();
  const name = settings ? (lang === 'pl' ? settings.site_name_pl : settings.site_name_en) : null;
  return (
    <Link to={to} className="inline-flex items-center gap-2.5">
      <SiteLogo size={size} tone={tone} className={logoClassName} />
      {showName && name && (
        <span className={`font-display font-semibold tracking-tight ${nameClassName}`}>
          {name}
        </span>
      )}
    </Link>
  );
}