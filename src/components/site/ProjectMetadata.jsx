import { useLang } from '@/lib/i18n';
import { useSEO } from '@/hooks/use-seo';
import { creativeWorkJsonLd, absUrl } from '@/lib/seo';

export default function ProjectMetadata({ project, slug }) {
  const { lang, tr } = useLang();
  const title = project ? (tr(project, 'seo_title') || tr(project, 'title')) : (lang === 'pl' ? 'Nie znaleziono projektu' : 'Project not found');
  const description = project ? (tr(project, 'seo_description') || tr(project, 'excerpt') || '') : '';
  const path = '/projects/' + encodeURIComponent(project?.slug || slug);
  useSEO({
    title,
    description,
    image: project?.cover_image || '',
    canonical: absUrl(path),
    lang,
    type: 'article',
    robots: project ? 'index,follow' : 'noindex,follow',
    replaceDefaults: true,
    jsonLd: project ? { ...creativeWorkJsonLd(project, path), name: title, description, inLanguage: lang } : undefined,
  });
  return null;
}