import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { useSite } from './SiteProvider';
import { SiteBrand } from './SiteLogo';
import { ARTIST_NAME } from '@/lib/brand';
import { Instagram, Linkedin, Youtube, Facebook } from 'lucide-react';

export default function SiteFooter() {
  const { lang, t } = useLang();
  const { settings } = useSite();
  if (!settings) return null;

  const year = new Date().getFullYear();
  const socials = [
    { url: settings.instagram, icon: Instagram },
    { url: settings.linkedin, icon: Linkedin },
    { url: settings.youtube, icon: Youtube },
    { url: settings.facebook, icon: Facebook },
  ].filter((s) => s.url);

  return (
    <footer className="bg-[var(--accent,#CBFF00)] text-black mt-24">
      <div className="px-5 md:px-10 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <SiteBrand size={40} nameClassName="text-3xl" />
          <div className="h-3" />
          {settings.tagline_en && (
            <p className="mt-3 text-black/70 max-w-sm">
              {lang === 'pl' ? settings.tagline_pl : settings.tagline_en}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-black/50 mb-4">{t('site.explore')}</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/about" className="text-black/70 hover:text-black">{t('site.about')}</Link></li>
            <li><Link to="/projects" className="text-black/70 hover:text-black">{t('site.projects')}</Link></li>
            <li><Link to="/offers" className="text-black/70 hover:text-black">{t('site.offers')}</Link></li>
            <li><Link to="/news" className="text-black/70 hover:text-black">{t('site.news')}</Link></li>
            <li><Link to="/shop" className="text-black/70 hover:text-black">{t('site.shop')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-black/50 mb-4">{t('site.contact')}</p>
          <ul className="space-y-2.5 text-sm">
            {settings.email && <li><a href={`mailto:${settings.email}`} className="text-black/70 hover:text-black">{settings.email}</a></li>}
            {settings.phone && <li><a href={`tel:${settings.phone}`} className="text-black/70 hover:text-black">{settings.phone}</a></li>}
            {settings.address_en && <li className="text-black/70">{lang === 'pl' ? settings.address_pl : settings.address_en}</li>}
          </ul>
          {socials.length > 0 && (
            <div className="flex gap-3 mt-5">
              {socials.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-black/20 flex items-center justify-center text-black/60 hover:text-white hover:bg-black transition">
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="px-5 md:px-10 py-5 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-black/60">
        <span>© {year} {ARTIST_NAME}</span>
        <div className="flex items-center gap-4">
          <span>{t('site.rights')}</span>
          <Link to="/admin" className="hover:text-black transition opacity-60 hover:opacity-100">Panel</Link>
        </div>
      </div>
    </footer>
  );
}