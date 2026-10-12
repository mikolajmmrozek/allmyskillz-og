import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useSite } from './SiteProvider';
import { LANGUAGE_MAP, langNative } from '@/lib/languages';

// Visitor-facing language selector. Shows only the languages enabled in
// Site Settings (primary + English are always present). Falls back to
// primary + English when settings haven't loaded yet.
export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const { settings } = useSite();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const primary = settings?.primary_language || 'pl';
  const enabled = settings?.enabled_languages?.length
    ? settings.enabled_languages
    : [primary, 'en'];
  // Always include primary and English; filter to known codes.
  const available = Array.from(new Set([primary, 'en', ...enabled]))
    .filter((code) => LANGUAGE_MAP[code]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-foreground px-2.5 py-1.5 rounded-full border border-neutral-200 transition"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider">{lang}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 max-h-72 overflow-y-auto bg-background border border-border rounded-xl shadow-lg z-50">
          {available.map((code) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-neutral-50 transition ${lang === code ? 'text-foreground font-medium' : 'text-neutral-600'}`}
            >
              {langNative(code)}
              {lang === code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}