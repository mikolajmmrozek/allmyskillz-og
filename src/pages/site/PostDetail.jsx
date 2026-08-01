import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { fetchBySlug, fetchPublished } from '@/lib/siteData';
import { Image } from '@/components/ui/image';
import RichContent from '@/components/site/RichContent';
import { ArrowLeft } from 'lucide-react';

export default function PostDetail() {
  const { slug } = useParams();
  const { lang, tr, t } = useLang();
  const [post, setPost] = useState(null);
  const [more, setMore] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBySlug('Post', slug).then(async (p) => {
      setPost(p);
      if (p) {
        const all = await fetchPublished('Post', '-published_date', 100).catch(() => []);
        setMore(all.filter((x) => x.id !== p.id).slice(0, 3));
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="px-5 md:px-10 py-32 text-center text-neutral-400">…</div>;
  if (!post) return <div className="px-5 md:px-10 py-32 text-center text-neutral-400">Not found.</div>;

  return (
    <div>
      <article className="px-5 md:px-10 pt-10 pb-16 max-w-3xl">
        <Link to="/news" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> {t('site.backToAll')}
        </Link>
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 mt-10">
          {post.published_date ? new Date(post.published_date).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        </p>
        <h1 className="font-display font-semibold tracking-[-0.03em] leading-[1.02] text-4xl md:text-6xl mt-4">
          {tr(post, 'title')}
        </h1>
        {post.excerpt_en && <p className="text-lg text-neutral-600 mt-6">{tr(post, 'excerpt')}</p>}
      </article>

      {post.featured_image && (
        <div className="px-5 md:px-10">
          <div className="rounded-3xl overflow-hidden bg-neutral-100 aspect-[16/9] max-w-5xl mx-auto">
            <Image src={post.featured_image} fittingType="fill" className="w-full h-full" />
          </div>
        </div>
      )}

      <div className="px-5 md:px-10 py-16 max-w-3xl">
        <RichContent html={tr(post, 'content')} className="text-lg leading-relaxed text-neutral-800" />
        {(post.gallery || []).length > 0 && (
          <div className="grid gap-4 mt-10 md:grid-cols-2">
            {post.gallery.map((g, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-neutral-100">
                <Image src={g} fittingType="fill" className="w-full h-full" />
              </div>
            ))}
          </div>
        )}
      </div>

      {more.length > 0 && (
        <section className="px-5 md:px-10 py-16 border-t border-neutral-200">
          <h2 className="font-display text-2xl tracking-tight mb-8">{t('site.latestNews')}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {more.map((p) => (
              <Link key={p.id} to={`/news/${p.slug}`} className="group">
                {p.featured_image && (
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 mb-4">
                    <Image src={p.featured_image} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" />
                  </div>
                )}
                <h3 className="font-display text-lg tracking-tight group-hover:underline">{tr(p, 'title')}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}