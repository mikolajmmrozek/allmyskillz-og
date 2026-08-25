import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Single source of truth for all machine-readable endpoints (llms.txt,
// sitemap). Fetches ONLY public, published records via the service role — no
// user auth, no ContactMessage, no User, no admin-only data.
export const SITE_URL = 'https://mikolajmrozek.base44.app';
export const ARTIST_NAME = 'Mikołaj Mrozek';

export function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchPublicPortfolio(req) {
  const base44 = createClientFromRequest(req);
  const svc = base44.asServiceRole;

  const [
    homeArr, settingsArr, experience, education, skills, projects,
    achievements, awards, certificates, languages, offers, posts, partners, products,
  ] = await Promise.all([
    svc.entities.HomepageConfig.list('-created_date', 1),
    svc.entities.SiteSetting.list('-created_date', 1),
    svc.entities.Experience.list('sort_order', 200),
    svc.entities.Education.list('sort_order', 200),
    svc.entities.Skill.list('sort_order', 200),
    svc.entities.Project.list('-sort_order', 200),
    svc.entities.Achievement.list('sort_order', 200),
    svc.entities.Award.list('sort_order', 200),
    svc.entities.Certificate.list('sort_order', 200),
    svc.entities.Language.list('sort_order', 200),
    svc.entities.Offer.list('sort_order', 200),
    svc.entities.Post.list('-published_date', 200),
    svc.entities.Partner.list('sort_order', 200),
    svc.entities.Product.list('-sort_order', 200),
  ]);

  const pub = (arr) => (arr || []).filter((i) => i.status === 'published');

  return {
    home: homeArr && homeArr[0] ? homeArr[0] : null,
    settings: settingsArr && settingsArr[0] ? settingsArr[0] : null,
    experience: pub(experience),
    education: pub(education),
    skills: pub(skills),
    projects: pub(projects),
    achievements: pub(achievements),
    awards: pub(awards),
    certificates: pub(certificates),
    languages: pub(languages),
    offers: pub(offers),
    posts: pub(posts),
    partners: pub(partners),
    products: pub(products),
  };
}