# Working map for Local Partners

Replace the stylized SVG street grid in the Rewards and Perks → Local Partners tab with a real, interactive Google map showing each local merchant pin in its actual neighborhood.

## What changes

- The map panel becomes a real Google Map (pan, zoom, street/place labels) centered on the selected metro.
- Each local merchant gets a real pin at coordinates inside its actual neighborhood (SoHo, Williamsburg, West Loop, etc.), scattered deterministically within the district rather than at an exact street address.
- Pin size still reflects estimated annual value; pin color still reflects category.
- Hover shows the existing tooltip card (name, neighborhood, category, estimated value); click selects the merchant and highlights the matching row in the side list, same as today.
- Switching metros re-centers and re-zooms the map to that city.
- Category legend stays pinned in the corner.
- Everything else on the tab (metro switcher, cluster chips, merchant list, Find contact dialog) is unchanged.

## Setup note

This uses the Lovable-managed Google Maps connection. The managed key is restricted to `*.lovable.app` preview and published URLs, so the map will render there. On your custom domain `ventusai.dev` it would need your own Google Cloud API key — I can walk you through that separately when you want it live on that domain.

## Technical notes

- Connect the `google_maps` connector (managed) so `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY` is available in the browser.
- Add `lat`/`lng` to `Metro` (city center + zoom) and to `LocalPartner` in `src/lib/merchantPartnershipData.ts`, plus a hand-set `NEIGHBORHOOD_COORDS` map keyed by `metroId:neighborhood`. Merchant coords derive deterministically from the neighborhood anchor plus a seeded offset, so pins are stable across renders. Existing `x`/`y` fields stay for now to avoid touching unrelated code.
- Rewrite `MetroStreetMap.tsx` to load the Maps JavaScript API with `loading=async` + a global `callback`, the browser key, and the connector tracking ID as `channel`. Use `google.maps.Marker` (no `mapId`, no AdvancedMarkerElement) with SVG symbol icons for size/color. No gateway calls, no geocoding — all coordinates are static, so the page stays LLM-free and adds no per-view API cost beyond map loads.
- Loader is a small shared hook/util so the script tag is injected once per session; render a light skeleton while loading and a plain fallback message if the key is missing.
- Keep the strict light theme: white surfaces, slate-200 border, rounded-xl, same 440px height.
