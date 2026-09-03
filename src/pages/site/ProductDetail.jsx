import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { fetchBySlug } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import RichContent from '@/components/site/RichContent';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useSEO } from '@/hooks/use-seo';
import { productJsonLd, absUrl } from '@/lib/seo';

export default function ProductDetail() {
  const { slug } = useParams();
  const { lang, tr, t } = useLang();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useSEO({
    title: product && (tr(product, 'seo_title') || tr(product, 'title')),
    description: product && (tr(product, 'seo_description') || tr(product, 'title')),
    image: product?.images?.[0],
    canonical: absUrl('/shop/' + slug),
    type: 'product',
    jsonLd: product ? productJsonLd(product, '/shop/' + slug) : undefined,
  });

  useEffect(() => {
    setLoading(true);
    fetchBySlug('Product', slug).then((p) => { setProduct(p); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="px-5 md:px-10 py-32 text-center text-neutral-400">…</div>;
  if (!product) return <div className="px-5 md:px-10 py-32 text-center text-neutral-400">Not found.</div>;

  const images = product.images || [];
  const variants = product.variants || [];
  const inStock = (product.stock ?? 0) > 0 || variants.some((v) => (v.stock ?? 0) > 0);

  return (
    <div>
      <div className="px-5 md:px-10 pt-10">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> {t('site.backToAll')}
        </Link>
      </div>

      <div className="px-5 md:px-10 py-12 grid md:grid-cols-2 gap-10 md:gap-16">
        <div>
          <div className="rounded-3xl overflow-hidden bg-neutral-100 aspect-[4/5]">
            {images[active] && <Image src={images[active]} fittingType="fill" className="w-full h-full" />}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {images.map((im, i) => (
                <button key={i} onClick={() => setActive(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === active ? 'border-black' : 'border-transparent'}`}>
                  <Image src={im} fittingType="fill" className="w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display font-semibold tracking-[-0.02em] text-4xl md:text-5xl">{tr(product, 'title')}</h1>
          <p className="mt-4 font-display text-2xl">
            {product.currency || 'PLN'} {product.price}
            {product.compare_price ? <span className="line-through ml-3 text-neutral-300 text-lg">{product.compare_price}</span> : null}
          </p>

          <div className="mt-8">
            <RichContent html={tr(product, 'description')} className="text-neutral-700 leading-relaxed" />
          </div>

          {variants.length > 0 && (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 mb-3">{lang === 'pl' ? 'Warianty' : 'Variants'}</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full border border-neutral-300 text-sm">
                    {tr(v, 'name')} · {v.price ?? product.price}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center gap-3">
            <Link
              to="/contact"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium ${inStock ? 'bg-[var(--accent,#CBFF00)] text-black hover:opacity-90' : 'bg-neutral-200 text-neutral-400 pointer-events-none'}`}
            >
              {inStock ? <>{t('site.buyNow')} <ArrowUpRight className="w-4 h-4" /></> : t('site.outOfStock')}
            </Link>
            {product.is_digital && <span className="text-sm text-neutral-500">{lang === 'pl' ? 'Plik cyfrowy' : 'Digital download'}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}