import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { useSite } from './SiteProvider';
import { SiteBrand } from './SiteLogo';
import { ARTIST_NAME } from '@/lib/brand';
import { Instagram, Linkedin, Youtube, Facebook } from 'lucide-react';
import TikTokIcon from '@/components/site/TikTokIcon';

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
    { url: settings.tiktok, icon: TikTokIcon },
  ].filter((s) => s.url);

  return (
    <footer className="bg-black text-neutral-300 mt-24">
      <div className="px-5 md:px-10 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <SiteBrand size={40} tone="light" nameClassName="text-3xl text-neutral-200" />
          <div className="h-3" />
          {settings.tagline_en && (
            <p className="mt-3 text-neutral-400 max-w-sm">
              {lang === 'pl' ? settings.tagline_pl : settings.tagline_en}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 mb-4">{t('site.explore')}</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/about" className="text-neutral-400 hover:text-[#CBFF00] transition">{t('site.about')}</Link></li>
            <li><Link to="/projects" className="text-neutral-400 hover:text-[#CBFF00] transition">{t('site.projects')}</Link></li>
            <li><Link to="/offers" className="text-neutral-400 hover:text-[#CBFF00] transition">{t('site.offers')}</Link></li>
            <li><Link to="/news" className="text-neutral-400 hover:text-[#CBFF00] transition">{t('site.news')}</Link></li>
            <li><Link to="/shop" className="text-neutral-400 hover:text-[#CBFF00] transition">{t('site.shop')}</Link></li>
            <li><Link to="/contact" className="text-neutral-400 hover:text-[#CBFF00] transition">{t('site.contact')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 mb-4">{t('site.contact')}</p>
          <ul className="space-y-2.5 text-sm">
            {settings.email && <li><a href={`mailto:${settings.email}`} className="text-neutral-400 hover:text-[#CBFF00] transition">{settings.email}</a></li>}
            {settings.phone && <li><a href={`tel:${settings.phone}`} className="text-neutral-400 hover:text-[#CBFF00] transition">{settings.phone}</a></li>}
            {settings.address_en && <li className="text-neutral-400">{lang === 'pl' ? settings.address_pl : settings.address_en}</li>}
          </ul>
          {socials.length > 0 && (
            <div className="flex gap-3 mt-5">
              {socials.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-black hover:bg-[#CBFF00] hover:border-[#CBFF00] transition">
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="px-5 md:px-10 py-5 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
        <span>© {year} {ARTIST_NAME}</span>
        <div className="flex items-center gap-4">
          <span>{t('site.rights')}</span>
          <Link to="/admin" className="hover:text-[#CBFF00] transition">Panel</Link>
        </div>
      </div>
    </footer>
  );
}