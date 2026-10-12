// The artist's name is a proper noun — it must never be translated or
// auto-translated. This constant is the fallback used before a site owner
// sets their own `site_name` in Site Settings.
export const ARTIST_NAME = 'Mikołaj Mrozek';

// Split into lines for display headlines (e.g. the homepage hero).
export const ARTIST_NAME_LINES = ARTIST_NAME.split(' ');

// Resolve the display name from the SiteSetting record (localized). Returns
// an empty string until the site owner sets `site_name` in Site Settings, so
// the header, homepage hero, footer and admin sidebar stay blank until then.
export function displayName(settings, lang, primaryLang = 'pl') {
  if (!settings) return '';
  const primary = settings.site_name_pl;
  const en = settings.site_name_en;
  if (lang === primaryLang) return primary || en || '';
  if (lang === 'en') return en || primary || '';
  const translated = settings.translations?.[lang]?.site_name;
  return translated || primary || en || '';
}

// Lines for the homepage hero, derived from the site name. Empty (no lines)
// when no site name is set yet.
export function displayNameLines(settings, lang, primaryLang = 'pl') {
  const name = displayName(settings, lang, primaryLang);
  return name ? name.split(' ') : [];
}