import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { fetchPublished } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import { ArrowUpRight } from 'lucide-react';

export default function Shop() {
  const { tr, t } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublished('Product', 'sort_order', 200)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-5 md:px-10 pt-16 md:pt-24 pb-20">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-6">{t('site.shop')}</p>
      <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[12vw] md:text-[7vw] lg:text-[6.5rem]">
        {t('site.allProducts')}
      </h1>

      {loading ? (
        <div className="py-20 text-center text-neutral-400">…</div>
      ) : products.length === 0 ? (
        <p className="mt-16 text-neutral-400">—</p>
      ) : (
        <div className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link key={p.id} to={`/shop/${p.slug}`} className="group">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                {p.images?.[0] && <Image src={p.images[0]} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" />}
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl tracking-tight">{tr(p, 'title')}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{p.currency || 'PLN'} {p.price}{p.compare_price ? <span className="line-through ml-2 text-neutral-300">{p.compare_price}</span> : null}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-black shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}