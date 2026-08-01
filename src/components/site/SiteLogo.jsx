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

// Pure image badge. Renders nothing until the logo url is known.
export default function SiteLogo({ size = 36, rounded = 'rounded-xl', className = '' }) {
  const settings = useBranding();
  const url = settings?.logo_url;
  if (!url) {
    return (
      <span
        style={{ width: size, height: size }}
        className={`${rounded} bg-black ${className}`}
      />
    );
  }
  return (
    <img
      src={url}
      alt={settings?.site_name_en || 'Logo'}
      width={size}
      height={size}
      className={`${rounded} object-cover bg-black ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// Logo + wordmark, language-aware. Used across header/footer/auth/admin.
export function SiteBrand({ to = '/', size = 36, nameClassName = '', logoClassName = '', showName = true }) {
  const { lang } = useLang();
  const settings = useBranding();
  const name = settings ? (lang === 'pl' ? settings.site_name_pl : settings.site_name_en) : null;
  return (
    <Link to={to} className="inline-flex items-center gap-2.5">
      <SiteLogo size={size} className={logoClassName} />
      {showName && name && (
        <span className={`font-display font-semibold tracking-tight ${nameClassName}`}>
          {name}
        </span>
      )}
    </Link>
  );
}