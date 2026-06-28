// Reuse dashboard API responses briefly for the same logged-in browser.
// private keeps user-specific records out of shared/proxy caches.
export const PRIVATE_CACHE_HEADERS = {
  "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
} as const;
