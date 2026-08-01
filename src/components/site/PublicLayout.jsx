import React from 'react';
import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { SiteProvider, useSite } from './SiteProvider';

const Shell = () => {
  const { settings } = useSite();
  const accent = settings?.accent_color || '#CBFF00';
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD] text-[#121212]" style={{ '--accent': accent }}>
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