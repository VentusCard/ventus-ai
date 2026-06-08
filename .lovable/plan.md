## Goal
Make the "Send to picker" button actually open a stock image selector prefilled with that microsegment's imagery query, so the picker is one click away from the right results.

## Approach
No real stock API integration (no keys, no backend). Open the picker in a new tab via a deep-link URL the provider already exposes for search. Default to Unsplash; let the user switch provider per environment. Each persona card carries its own brief, so the URL is built per card.

## New helper
`src/lib/stockPickerLink.ts`
- `type StockProvider = "unsplash" | "pexels" | "getty"`
- `STOCK_PROVIDERS`: array with `{ id, label, buildUrl(query) }`:
  - Unsplash → `https://unsplash.com/s/photos/${encodeURIComponent(slug(query))}?orientation=landscape`
  - Pexels → `https://www.pexels.com/search/${encodeURIComponent(slug(query))}/?orientation=landscape`
  - Getty → `https://www.gettyimages.com/photos/${encodeURIComponent(slug(query))}?phrase=${encodeURIComponent(query)}&assettype=image&orientations=horizontal`
- `slug(query)` collapses commas/spaces to single spaces, trims length to ~80 chars (providers ignore long tails), strips the "no people" tail when it's a stop-word for that provider.
- `buildStockPickerUrl(provider, brief)` returns the final URL, using `brief.query` + first 3 `keywords` as the search phrase.
- `DEFAULT_PROVIDER: StockProvider = "unsplash"` (no key required).

## Frontend changes
`src/components/tepilot/campaigns/SegmentOutputPanel.tsx`
- Add a small provider selector at the panel header (right side, next to the "N personalized variants" badge): a compact `Select` ("Picker · Unsplash | Pexels | Getty"). Local component state, defaults to Unsplash. Applies to all cards.
- On each card, replace the existing no-op "Send to picker" toast with:
  - Compute `url = buildStockPickerUrl(provider, brief)`.
  - Render as an `<a href={url} target="_blank" rel="noopener noreferrer">` styled like the current outline button (use `asChild` on the existing Button so styling stays identical).
  - Button label becomes `Open in {providerLabel}` and the icon stays `Send`.
  - Keep the toast on click as a confirmation: `"Opening {providerLabel} with this brief"`.
- Keep the "Copy brief" button unchanged.
- Persist the chosen provider in `sessionStorage` under `tepilot.stockPicker.provider` so a banker doesn't re-pick per visit. Read once on mount, write on change.

## Out of scope
- No real API/auth integration with the picker.
- No DAM/Bynder/Brandfolder hookup (would need creds).
- No image preview/embed back in the card.
- No changes to brief generation, messages, audience math, or other views.

## Files touched
- New: `src/lib/stockPickerLink.ts`
- Edit: `src/components/tepilot/campaigns/SegmentOutputPanel.tsx`
