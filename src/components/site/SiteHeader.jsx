import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { useSite } from './SiteProvider';
import { Menu, X, Globe } from 'lucide-react';

export default function SiteHeader() {
  const { lang, setLang, t } = useLang();
  const { settings, nav } = useSite();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  const links = [
    { to: '/about', label: t('site.about') },
    { to: '/projects', label: t('site.projects') },
    { to: '/offers', label: t('site.offers') },
    { to: '/news', label: t('site.news') },
    { to: '/shop', label: t('site.shop') },
    { to: '/contact', label: t('site.contact') },
  ];

  const isActive = (p) => loc.pathname === p || (p !== '/' && loc.pathname.startsWith(p));

  return (
    <header className="sticky top-0 z-50 bg-[#FDFDFD]/80 backdrop-blur-xl border-b border-neutral-200/70">
      <div className="px-5 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-lg tracking-tight font-semibold">
          {settings ? (lang === 'pl' ? settings.site_name_pl : settings.site_name_en) : 'Studio'}
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`transition relative ${isActive(l.to) ? 'text-black' : 'text-neutral-500 hover:text-black'}`}
            >
              {l.label}
              {isActive(l.to) && <span className="absolute -bottom-1 left-0 right-0 h-px bg-[var(--accent,#CBFF00)]" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'pl' : 'en')}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black px-2.5 py-1.5 rounded-full border border-neutral-200"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">{lang}</span>
          </button>
          <button onClick={() => setOpen((v) => !v)} className="md:hidden p-2 -mr-2">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-neutral-200 bg-[#FDFDFD]">
          <nav className="flex flex-col px-5 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`py-3 text-base border-b border-neutral-100 last:border-0 ${isActive(l.to) ? 'text-black' : 'text-neutral-600'}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}