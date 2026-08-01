import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { ArrowUpRight, Globe } from 'lucide-react';

// Phase 1 preview landing — reads all content from the CMS (HomepageConfig + SiteSetting + Navigation).
// The full editorial public site is built in Phase 2.
export default function Home() {
  const { lang, setLang, tr } = useLang();
  const [home, setHome] = useState(null);
  const [settings, setSettings] = useState(null);
  const [nav, setNav] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [h, s, n] = await Promise.all([
          base44.entities.HomepageConfig.list('-created_date', 1),
          base44.entities.SiteSetting.list('-created_date', 1),
          base44.entities.NavigationItem.list('sort_order', 50),
        ]);
        setHome(h[0] || null);
        setSettings(s[0] || null);
        setNav(n.filter((i) => i.status === 'published'));
      } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#121212]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 md:px-12 py-5">
        <span className="font-semibold tracking-tight">{tr(settings, 'site_name') || 'Studio'}</span>
        <nav className="hidden md:flex items-center gap-7 text-sm">
          {nav.map((n) => (
            <Link key={n.id} to={n.href} className="text-neutral-500 hover:text-black transition">{tr(n, 'label')}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => setLang(lang === 'en' ? 'pl' : 'en')} className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black">
            <Globe className="w-3.5 h-3.5" /> <span className="uppercase">{lang}</span>
          </button>
          <Link to="/admin" className="text-xs px-3 py-1.5 rounded-full bg-[#CBFF00] text-black font-medium hover:opacity-90">Admin</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 md:pt-28 pb-24 max-w-6xl">
        <div className="inline-flex items-center gap-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#CBFF00]" />
          <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">{tr(home, 'focus') || 'Personal Brand Platform'}</span>
        </div>
        <h1 className="font-semibold tracking-[-0.04em] leading-[0.95] text-[14vw] md:text-[9vw] lg:text-[7.5rem]">
          {tr(home, 'headline') || 'Living\nPortfolio.'}
        </h1>
        <div className="mt-10 max-w-xl text-lg text-neutral-600 leading-relaxed">
          {tr(home, 'intro') || 'A creative director’s archive — portfolio, story, projects, workshops and shop, all in one place.'}
        </div>
        <div className="flex flex-wrap gap-3 mt-10">
          {(home?.cta_primary_link) && (
            <Link to={home.cta_primary_link} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#CBFF00] text-black font-medium text-sm hover:opacity-90">
              {tr(home, 'cta_primary_text') || 'Explore'} <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
          {(home?.cta_secondary_link) && (
            <Link to={home.cta_secondary_link} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-300 text-sm font-medium hover:border-black transition">
              {tr(home, 'cta_secondary_text') || 'Contact'}
            </Link>
          )}
        </div>
      </section>

      {/* Phase note */}
      <section className="px-6 md:px-12 pb-24 max-w-6xl">
        <div className="border-t border-neutral-200 pt-10 grid md:grid-cols-3 gap-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">Phase 1</p>
            <p className="text-sm text-neutral-600">CMS foundation complete — every collection, media library, translations, settings & navigation are manageable from the admin panel.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">Phase 2</p>
            <p className="text-sm text-neutral-600">Full public editorial site: timelines, masonry projects, blog, shop & search.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">Start here</p>
            <Link to="/admin" className="text-sm font-medium underline underline-offset-4">Open the Studio →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}