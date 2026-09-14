// Minimal session cache for Suspense-based data fetching. Each `key` maps to
// an entry that is either pending (holds a promise), resolved (holds data), or
// rejected (holds an error). `useSuspense` throws the pending promise so a
// <Suspense> boundary above the component shows its fallback; once the promise
// settles, React retries the component and the hook returns data synchronously
// on that first real render — so hooks called AFTER it (e.g. useSEO) run with
// the data already in hand, never with an empty loading state.
//
// This is what makes per-entity og:image/title reliable for crawlers: the
// prerenderer never sees an intermediate render where useSEO has been called
// with null data.
const cache = new Map();

export function useSuspense(key, fetcher) {
  let entry = cache.get(key);
  if (!entry) {
    entry = { status: 'pending', data: undefined, error: null, promise: null };
    entry.promise = (async () => {
      try {
        const data = await fetcher();
        entry.data = data;
        entry.status = 'resolved';
      } catch (err) {
        entry.error = err;
        entry.status = 'rejected';
      }
    })();
    cache.set(key, entry);
  }
  if (entry.status === 'pending') throw entry.promise;
  if (entry.status === 'rejected') throw entry.error;
  return entry.data;
}

// Bust cached entries by key prefix (or all when omitted). Useful after an
// admin edit if the same browser session should re-fetch on next visit.
export function clearSuspenseCache(prefix) {
  if (!prefix) { cache.clear(); return; }
  for (const k of [...cache.keys()]) if (k.startsWith(prefix)) cache.delete(k);
}