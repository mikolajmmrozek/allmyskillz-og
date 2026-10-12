import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { SiteProvider, useSite } from './SiteProvider';
import { useSiteTheme } from '@/lib/siteTheme';
import { useLang } from '@/lib/i18n';

const Shell = () => {
  const { settings } = useSite();
  const { setLang, setPrimaryLang, dir } = useLang();
  const { shellClass, shellStyle } = useSiteTheme(settings);

  // Sync the i18n primary language with site settings, and default first-time
  // visitors to the site's primary language. English is always reachable via
  // the switcher.
  useEffect(() => {
    if (settings?.primary_language) setPrimaryLang(settings.primary_language);
    const stored = localStorage.getItem('portfolio_lang');
    if (!stored && settings?.primary_language) {
      setLang(settings.primary_language);
    }
  }, [settings?.primary_language, setLang, setPrimaryLang]);

  // Set document direction for RTL languages (Arabic, Persian, Urdu).
  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);
  return (
    <div className={`min-h-screen flex flex-col bg-background text-foreground ${shellClass}`} style={shellStyle}>
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
};

export default function PublicLayout() {
  return (
    <SiteProvider>
      <Shell />
    </SiteProvider>
  );
}