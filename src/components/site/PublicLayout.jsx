import React from 'react';
import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { SiteProvider, useSite } from './SiteProvider';
import { useSiteTheme } from '@/lib/siteTheme';

const Shell = () => {
  const { settings } = useSite();
  const { shellClass, shellStyle } = useSiteTheme(settings);
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