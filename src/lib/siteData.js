import { base44 } from '@/api/base44Client';

// Fetch site-wide singletons + navigation in one pass.
export async function fetchSite() {
  const [home, settings, nav] = await Promise.all([
    base44.entities.HomepageConfig.list('-created_date', 1),
    base44.entities.SiteSetting.list('-created_date', 1),
    base44.entities.NavigationItem.list('sort_order', 50),
  ]);
  return {
    home: home[0] || null,
    settings: settings[0] || null,
    nav: (nav || []).filter((n) => n.status === 'published'),
  };
}

// Published records only, sorted.
export async function fetchPublished(entity, sort = 'sort_order', limit = 200) {
  const items = await base44.entities[entity].list(sort, limit);
  return (items || []).filter((i) => i.status === 'published');
}

export async function fetchBySlug(entity, slug) {
  const items = await base44.entities[entity].filter({ slug }, undefined, 5);
  const pub = (items || []).filter((i) => i.status === 'published');
  return pub[0] || null;
}

// Resolve an array of ids into full records (relation arrays store ids).
export async function fetchByIds(entity, ids = []) {
  if (!ids?.length) return [];
  const all = await base44.entities[entity].list('-created_date', 500);
  const set = new Set(ids);
  return (all || []).filter((i) => set.has(i.id));
}

// One record by id.
export async function fetchOne(entity, id) {
  if (!id) return null;
  try { return await base44.entities[entity].get(id); } catch { return null; }
}