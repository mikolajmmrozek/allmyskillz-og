import React, { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { fetchBySlug, fetchPublished, fetchByIds } from '@/lib/siteData';
import { useSuspense } from '@/lib/suspenseCache';
import CenterSpinner from '@/components/site/CenterSpinner';
import { Image } from '@/components/ui/image';
import RichContent from '@/components/site/RichContent';
import { Reveal } from '@/components/site/Motion';
import GalleryMasonry from '@/components/site/GalleryMasonry';
import VideoEmbed from '@/components/site/VideoEmbed';
import { ArrowLeft } from 'lucide-react';
import { useSEO } from '@/hooks/use-seo';
import { articleJsonLd, absUrl } from '@/lib/seo';

export default function PostDetail() {
  const { slug } = useParams();
  return (
    <Suspense fallback={<CenterSpinner />}>
      <PostDetailContent slug={slug} />
    </Suspense>
  );
}

function PostDetailContent({ slug }) {
  const { lang, tr, t } = useLang();
  const { post, category, tags, more } = useSuspense(`post:${slug}`, async () => {
    const post = await fetchBySlug('Post', slug);
    if (!post) return { post: null, category: null, tags: [], more: [] };
    const [all, tagRecs] = await Promise.all([
      fetchPublished('Post', '-published_date', 100).catch(() => []),
      fetchByIds('Tag', post.tag_ids || []),
    ]);
    let category = null;
    if (post.category_id) {
      const cat = await fetchByIds('Category', [post.category_id]);
      category = cat[0] || null;
    }
    const more = all.filter((x) => x.id !== post.id).slice(0, 3);
    return { post, category, tags: tagRecs, more };
  });

  useSEO({
    title: post ? (tr(post, 'seo_title') || tr(post, 'title')) : (lang === 'pl' ? 'Mikołaj Mrozek — Aktualność' : 'Mikołaj Mrozek — Article'),
    description: post ? (tr(post, 'seo_description') || tr(post, 'excerpt')) : 'Portfolio Mikołaja Mrózka — tattoo artist i creative entrepreneur.',
    image: post?.featured_image,
    canonical: absUrl('/news/' + slug),
    type: 'article',
    jsonLd: post ? articleJsonLd(post, '/news/' + slug) : undefined,
  });

  if (!post) return <div className="px-5 md:px-10 py-32 text-center text-neutral-400">Not found.</div>;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const gallery = post.gallery || [];

  return (
    <div>
      <article className="px-5 md:px-10 pt-10 max-w-3xl">
        <Link to="/news" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> {t('site.backToAll')}
        </Link>
        <div className="flex items-center gap-3 mt-10 text-[11px] uppercase tracking-[0.2em] text-neutral-400">
          {category && <span>{tr(category, 'name')}</span>}
          <span>{fmtDate(post.published_date)}</span>
        </div>
        <Reveal>
          <h1 className="font-display font-semibold tracking-[-0.02em] leading-[1.02] text-4xl md:text-6xl lg:text-7xl mt-4">
            {tr(post, 'title')}
          </h1>
        </Reveal>
        {tr(post, 'excerpt') && <Reveal delay={0.1}><p className="text-lg md:text-xl text-neutral-600 mt-6 leading-relaxed">{tr(post, 'excerpt')}</p></Reveal>}
        {tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
            {tags.map((tg) => <span key={tg.id} className="text-sm text-neutral-400">#{tr(tg, 'name').replace(/\s+/g, '')}</span>)}
          </div>
        )}
      </article>

      {post.featured_image && (
        <div className="px-5 md:px-10 mt-10">
          <div className="rounded-3xl overflow-hidden bg-neutral-100 aspect-[16/9] max-w-5xl mx-auto">
            <img src={post.featured_image} alt={tr(post, 'title')} className="h-full w-full object-cover" />
          </div>
        </div>
      )}

      <div className="px-5 md:px-10 py-16 md:py-20 max-w-3xl">
        <Reveal>
          <RichContent html={tr(post, 'content')} className="text-lg leading-relaxed text-neutral-800" />
        </Reveal>

        {post.video_url && (
          <div className="mt-10">
            <VideoEmbed url={post.video_url} />
          </div>
        )}

        {gallery.length > 0 && (
          <div className="mt-10">
            <GalleryMasonry images={gallery} alt={tr(post, 'title')} />
          </div>
        )}
      </div>

      {more.length > 0 && (
        <section className="px-5 md:px-10 py-16 md:py-20 border-t border-neutral-200">
          <Reveal><h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">{t('site.latestNews')}</h2></Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {more.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <Link to={`/news/${p.slug}`} className="group">
                  {p.featured_image && (
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 mb-4">
                      <Image src={p.featured_image} fittingType="fill" className="w-full h-full transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  )}
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">{fmtDate(p.published_date)}</p>
                  <h3 className="font-display text-lg md:text-xl tracking-tight mt-2 group-hover:underline">{tr(p, 'title')}</h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}