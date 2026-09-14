import React from 'react';

// Centered loading indicator used as the <Suspense> fallback for detail pages
// while their per-entity data resolves.
export default function CenterSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full px-5">
      <div className="w-7 h-7 border-2 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />
    </div>
  );
}