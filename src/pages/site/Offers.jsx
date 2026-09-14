import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { fetchPublished } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import { ArrowUpRight } from 'lucide-react';
import { useSEO } from '@/hooks/use-seo';
import { SITE_URL } from '@/lib/seo';
import { ARTIST_NAME } from '@/lib/brand';

export default function Offers() {
  const { lang, tr, t } = useLang();
  useSEO({
    title: lang === 'pl' ? `${ARTIST_NAME} — Warsztaty i oferty` : `${ARTIST_NAME} — Workshops & Offers`,
    description: lang === 'pl'
      ? 'Warsztaty tatuażu, mentoring i współprace tworzone przez Mikołaja Mrozka.'
      : 'Tattoo workshops, mentoring and collaborations by Mikołaj Mrozek.',
    canonical: `${SITE_URL}/offers`,
  });
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublished('Offer', 'sort_order', 100)
      .then(setOffers)
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-5 md:px-10 pt-16 md:pt-24 pb-20">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-6">{t('site.offers')}</p>
      <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[12vw] md:text-[7vw] lg:text-[6.5rem]">
        {t('site.allOffers')}
      </h1>

      {loading ? (
        <div className="py-20 text-center text-neutral-400">…</div>
      ) : (
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {offers.map((o) => (
            <Link key={o.id} to={`/offers/${o.slug}`} className="group grid md:grid-cols-2 gap-6 p-6 rounded-3xl border border-neutral-200 hover:border-black transition">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
                {o.gallery?.[0] ? <Image src={o.gallery[0]} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" /> : null}
              </div>
              <div className="flex flex-col">
                <h3 className="font-display text-2xl tracking-tight">{tr(o, 'title')}</h3>
                {o.price != null && <p className="text-sm text-neutral-500 mt-2">{o.currency || 'PLN'} {o.price}</p>}
                {tr(o, 'cta_text') && <p className="text-sm text-neutral-600 mt-3 line-clamp-3">{tr(o, 'cta_text')}</p>}
                <span className="mt-auto pt-6 inline-flex items-center gap-1 text-sm">{t('site.readMore')} <ArrowUpRight className="w-4 h-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}