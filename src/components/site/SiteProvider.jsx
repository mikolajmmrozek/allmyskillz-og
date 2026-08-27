import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSite } from '@/lib/siteData';

export const SiteContext = createContext(null);

export const SiteProvider = ({ children }) => {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchSite()
      .then((s) => alive && setSite(s))
      .catch(() => alive && setSite({ home: null, settings: null, nav: [] }))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  // Google Search Console verification (meta-tag method). Injected globally so
  // it is present on the homepage when Googlebot fetches; platform prerenders
  // capture client-injected tags for crawlers.
  useEffect(() => {
    const code = site?.settings?.google_site_verification;
    if (!code) return;
    let el = document.head.querySelector('meta[name="google-site-verification"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'google-site-verification');
      document.head.appendChild(el);
    }
    el.setAttribute('content', code);
  }, [site]);

  return (
    <SiteContext.Provider value={{ ...site, loading }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
};