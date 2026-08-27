# Product card: 90-char copy, 3 bullets, better use of space

Go back to the tight 90-character quote, show three benefits in the phone mockup, and rebalance the card so it fills the frame without a scrollbar or any cut-off text.

## Changes

All in `src/components/exec-demo/ProductCardsPhoneView.tsx`:

1. **Quote back to 90 characters**
   - `QUOTE_MAX_CHARS`: 140 → 90. `fitQuote` keeps trimming at the last sentence boundary so copy always ends as a complete thought.

2. **Three benefits in compact mode**
   - Benefits slice goes from 2 back to 3 items in compact mode (same as full mode).

3. **Use the space better**
   - Quote sits at `text-[12.5px]` with relaxed leading — at 90 chars it renders in ~2 lines, freeing room the benefits block reclaims.
   - Benefits block keeps `flex-1 min-h-0` with slightly looser row spacing so three rows distribute across the freed vertical space instead of bunching at the top.
   - Keep the divider, the bold value line, and the full-width CTA pinned to the bottom of the card.

4. **No cut-off guarantees stay**
   - `nameSizeClass` and `ctaSizeClass` still step type size down instead of clamping, so the product name and CTA label never truncate.

## Also

- Update the quote-length memory rule back to 90 characters (the edge-function generation cap in `supabase/functions/generate-product-cards/index.ts` is already 90, so no backend change is needed).
- Verify at 1440px and 1920px that the card fills the mockup with no internal scrollbar.
