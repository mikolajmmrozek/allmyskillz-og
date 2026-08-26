import React from 'react';
import { useLang } from '@/lib/i18n';

// Grayscale logo credit band — "in collaboration with". Logos sit desaturated
// and bloom to full color on hover; falls back to the partner name when no
// logo is set. Each logo links to the partner's website when one exists.
export default function PartnerLogos({ partners, label, className = '' }) {
  const { tr } = useLang();
  if (!partners?.length) return null;
  return (
    <section className={`px-5 md:px-10 py-10 md:py-14 ${className}`}>
      {label && (
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 mb-6 text-center">{label}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {partners.map((pa) => {
          const inner = pa.logo_url ? (
            <img
              src={pa.logo_url}
              alt={tr(pa, 'name')}
              className="h-8 md:h-10 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition"
            />
          ) : (
            <span className="text-sm font-medium text-neutral-500 hover:text-black transition">{tr(pa, 'name')}</span>
          );
          return pa.website ? (
            <a key={pa.id} href={pa.website} target="_blank" rel="noreferrer">{inner}</a>
          ) : (
            <div key={pa.id}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}