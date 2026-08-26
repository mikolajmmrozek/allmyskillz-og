import { useEffect } from 'react';

// 12 leading-color presets for the picker.
export const ACCENT_PRESETS = [
  '#CBFF00', '#FF3D00', '#FF6B00', '#FFD600',
  '#00E676', '#00BFA5', '#2979FF', '#3D5AFE',
  '#7C4DFF', '#E91E63', '#212121', '#8D6E63',
];

// Each package overrides --font-display / --font-heading / --font-body on the
// public shell. `families` lists Google Fonts css2 family specs to load on
// demand (editorial ships in index.css already, so it needs none).
export const FONT_PACKAGES = {
  editorial: {
    label: 'Editorial',
    description: 'Fraunces + Inter',
    display: "'Fraunces', ui-serif, Georgia, serif",
    heading: "'Inter', ui-sans-serif, system-ui, sans-serif",
    body: "'Inter', ui-sans-serif, system-ui, sans-serif",
    families: [],
  },
  modern: {
    label: 'Modern Bold',
    description: 'Space Grotesk + Inter',
    display: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
    heading: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
    body: "'Inter', ui-sans-serif, system-ui, sans-serif",
    families: ['Space+Grotesk:wght@400;500;600;700'],
  },
  elegant: {
    label: 'Elegant Serif',
    description: 'Playfair Display + Source Sans 3',
    display: "'Playfair Display', ui-serif, Georgia, serif",
    heading: "'Playfair Display', ui-serif, Georgia, serif",
    body: "'Source Sans 3', ui-sans-serif, system-ui, sans-serif",
    families: ['Playfair+Display:wght@400;500;600;700', 'Source+Sans+3:wght@400;500;600;700'],
  },
  technical: {
    label: 'Clean Technical',
    description: 'IBM Plex Sans',
    display: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
    heading: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
    body: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
    families: ['IBM+Plex+Sans:wght@400;500;600;700'],
  },
};

function hexToRgb(hex) {
  const m = /^#?([a-f0-9]{6})$/i.exec((hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Black on light accents, white on dark accents — for readable text sitting on
// the accent surface (e.g. the homepage contact band).
export function contrastForeground(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
  return L > 0.45 ? '#000000' : '#ffffff';
}

function ensureFontLink(pkg) {
  if (typeof document === 'undefined') return;
  const id = 'site-font-package';
  const families = pkg?.families || [];
  const link = document.getElementById(id);
  if (!families.length) {
    if (link) link.remove();
    return;
  }
  const href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join('&')}&display=swap`;
  if (!link) {
    const el = document.createElement('link');
    el.id = id;
    el.rel = 'stylesheet';
    el.href = href;
    document.head.appendChild(el);
  } else if (link.getAttribute('href') !== href) {
    link.href = href;
  }
}

// Resolves accent / theme / font package from settings into shell class + CSS
// variables, and loads the chosen font package on demand.
export function useSiteTheme(settings) {
  const accent = settings?.accent_color || '#CBFF00';
  const theme = settings?.theme || 'light';
  const pkgKey = settings?.font_package || 'editorial';
  const pkg = FONT_PACKAGES[pkgKey] || FONT_PACKAGES.editorial;

  useEffect(() => { ensureFontLink(pkg); }, [pkg]);

  const shellClass = theme === 'dark' ? 'dark' : '';
  const shellStyle = {
    '--accent': accent,
    '--accent-ink': contrastForeground(accent),
    '--font-display': pkg.display,
    '--font-heading': pkg.heading,
    '--font-body': pkg.body,
  };
  return { shellClass, shellStyle };
}