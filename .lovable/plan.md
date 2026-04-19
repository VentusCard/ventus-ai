

## Goal

Make the collection cover images (Unsplash photos shown on the collection hero in the phone mockup) fetch fresh on every render instead of being served from browser cache.

## Approach

Append a unique query param (`&t=${timestamp}`) to each Unsplash URL in `getCollectionImage()` so the browser treats every render as a brand new image request and bypasses HTTP cache.

## Change — `src/components/exec-demo/GeneratedOffersPhoneView.tsx`

Update `getCollectionImage()` (line 83) to append a cache-buster:

```ts
function getCollectionImage(rollup: string, pillar?: string): string {
  const theme = (rollup + " " + (pillar || "")).toLowerCase();
  const buster = `&t=${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  for (const entry of COLLECTION_IMAGES) {
    if (entry.keywords.some(k => theme.includes(k))) return entry.url + buster;
  }
  return DEFAULT_IMAGE + buster;
}
```

Note: Unsplash ignores unknown query params but still returns a fresh response, and the browser keys cache by full URL, so this guarantees no cache reuse.

Both call sites (collection detail hero at line 209 and main carousel at line 276) use this function and will get fresh URLs every render.

## Verification

1. `/demo` → Next-Offer tab → click a persona pill → open DevTools Network tab → confirm Unsplash image request fires fresh (no `(disk cache)` / `(memory cache)`) and URL contains a `&t=…` suffix that changes on each navigation.

## Out of scope

Caching for any other images, deal logos, or static assets.

