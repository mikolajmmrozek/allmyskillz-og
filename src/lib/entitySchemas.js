// Local entity schema registry, sourced from the base44/entities/*.jsonc
// files at build time. The Base44 SDK in this app version does not expose a
// `base44.entities.X.schema()` method, so CollectionEditor reads schemas
// from here instead. Auto-discovers new entities — no manual sync needed.
const modules = import.meta.glob('/base44/entities/*.jsonc', { query: '?raw', import: 'default', eager: true });

// Minimal JSONC tolerance: strip // line comments, /* */ block comments,
// and trailing commas before JSON.parse. The entity files are plain JSON,
// but this keeps parsing safe if comments are ever added.
function stripJsonc(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/,\s*([}\]])/g, '$1');
}

const schemas = {};
for (const [path, raw] of Object.entries(modules)) {
  try {
    const obj = JSON.parse(stripJsonc(raw));
    const name = obj.name || path.split('/').pop().replace('.jsonc', '');
    schemas[name] = obj;
  } catch (e) {
    console.error('Failed to parse entity schema', path, e);
  }
}

export function getEntitySchema(entityName) {
  return schemas[entityName] || null;
}

export const entityNames = Object.keys(schemas);