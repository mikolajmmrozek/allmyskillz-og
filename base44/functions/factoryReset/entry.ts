import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Content entities the user can author. SiteSetting is deliberately excluded
// (it holds configuration, not content) so the brand/appearance survives reset.
const CONTENT_ENTITIES = [
  'Project', 'Post', 'Experience', 'Education', 'Achievement', 'Award',
  'Skill', 'Certificate', 'Language', 'Partner', 'Offer', 'Category', 'Tag',
  'MediaItem', 'ContactMessage', 'NavigationItem', 'HomepageConfig', 'Product',
];

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== 'USUŃ') {
      return Response.json({ error: 'Confirmation required' }, { status: 400 });
    }

    const counts: Record<string, number> = {};
    for (const name of CONTENT_ENTITIES) {
      const entity = (base44.asServiceRole.entities as any)[name];
      if (!entity) continue;
      try {
        await entity.deleteMany({});
        counts[name] = 1;
      } catch (e) {
        counts[name] = 0;
      }
    }
    return Response.json({ ok: true, counts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}