import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useLang } from '@/lib/i18n';

// Wraps SEO fields (invisible to site visitors) behind a collapsible button
// so the admin stays focused on content. Used by CollectionEditor for any
// group of fields whose key is SEO-related.
export default function SeoCollapsible({ children, hasContent = true }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  if (!hasContent) return null;

  return (
    <div className="border border-dashed border-neutral-300 rounded-xl bg-neutral-50/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-100/60 transition"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-neutral-600">
          <Search className="w-4 h-4" />
          {t('admin.seo_settings')}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-5 border-t border-neutral-200">
          <p className="text-xs text-neutral-400 pt-3 pb-4 leading-relaxed">{t('admin.seo_settings_desc')}</p>
          <div className="space-y-6">{children}</div>
        </div>
      )}
    </div>
  );
}