import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { fetchBySlug } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import RichContent from '@/components/site/RichContent';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

function Block({ title, children }) {
  if (!children) return null;
  return (
    <section>
      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 mb-4">{title}</p>
      {children}
    </section>
  );
}

export default function OfferDetail() {
  const { slug } = useParams();
  const { lang, tr, t } = useLang();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBySlug('Offer', slug).then((o) => { setOffer(o); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="px-5 md:px-10 py-32 text-center text-neutral-400">…</div>;
  if (!offer) return <div className="px-5 md:px-10 py-32 text-center text-neutral-400">Not found.</div>;

  const gallery = offer.gallery || [];
  const faq = offer.faq || [];

  return (
    <div>
      <div className="px-5 md:px-10 pt-10">
        <Link to="/offers" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> {t('site.backToAll')}
        </Link>
      </div>

      <header className="px-5 md:px-10 pt-10 pb-12 grid md:grid-cols-[2fr_1fr] gap-8 items-end">
        <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[10vw] md:text-[6vw] lg:text-[5.5rem]">
          {tr(offer, 'title')}
        </h1>
        {offer.price != null && (
          <div className="text-right">
            <p className="font-display text-3xl tracking-tight">{offer.currency || 'PLN'} {offer.price}</p>
            <Link to="/contact" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent,#CBFF00)] text-black text-sm font-medium">
              {t('site.enroll')} <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </header>

      {gallery[0] && (
        <div className="px-5 md:px-10">
          <div className="rounded-3xl overflow-hidden bg-neutral-100 aspect-[16/9]">
            <Image src={gallery[0]} fittingType="fill" className="w-full h-full" />
          </div>
        </div>
      )}

      <div className="px-5 md:px-10 py-16 grid md:grid-cols-2 gap-12 max-w-5xl">
        <Block title={t('site.about')}><RichContent html={tr(offer, 'description')} className="text-lg text-neutral-700 leading-relaxed" /></Block>
        <Block title="Mission"><RichContent html={tr(offer, 'mission')} className="text-neutral-700 leading-relaxed" /></Block>
        <Block title={lang === 'pl' ? 'Czego się nauczysz' : 'What you learn'}><RichContent html={tr(offer, 'learn')} className="text-neutral-700 leading-relaxed" /></Block>
      </div>

      {gallery.length > 1 && (
        <div className="px-5 md:px-10 pb-16 grid gap-4 md:grid-cols-3">
          {gallery.slice(1).map((g, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-neutral-100 aspect-[4/3]">
              <Image src={g} fittingType="fill" className="w-full h-full" />
            </div>
          ))}
        </div>
      )}

      {faq.length > 0 && (
        <section className="px-5 md:px-10 py-16 border-t border-neutral-200">
          <h2 className="font-display text-3xl tracking-tight mb-8">{t('site.faq')}</h2>
          <div className="max-w-3xl divide-y divide-neutral-200">
            {faq.map((f, i) => (
              <details key={i} className="py-5 group">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-medium">{tr(f, 'question')}</span>
                  <span className="text-neutral-400 group-open:rotate-45 transition">+</span>
                </summary>
                <RichContent html={tr(f, 'answer')} className="text-sm text-neutral-600 mt-3" />
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}