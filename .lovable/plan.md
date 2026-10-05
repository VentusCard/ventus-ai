# Move the scrollbar to the right side on slide 4.2

## Current state (verified)
- Slide 4.2 is a split panel: the 4.1 ledger on the left scrolls with its own visible scrollbar (`overflow-y-auto scrollbar-light` on `ledgerScrollRef`, DeckmoDeck.tsx line 334), and the enrichment panel on the right is `overflow-hidden`, driven by the ledger via `syncEnrichScroll`.
- Result: the scrollbar sits in the middle of the slide, between the ledger and the enrichment columns.

## Change
On step 1 (slide 4.2) only, flip which panel owns the scrollbar:

1. **Enrichment panel becomes the scroller** — in `RickyEnrichmentTable.tsx`, change `RickyEnrichmentPanel` from `overflow-hidden` to `overflow-y-auto scrollbar-light`, so the scrollbar renders at the far right edge of the slide. Add an `onScroll` prop that reports its scroll position up.
2. **Ledger scrollbar hidden on 4.2** — in `DeckmoDeck.tsx`, when `step === 1` render the ledger container with `overflow-y-auto` but scrollbar hidden (`scrollbar-width: none` via a small utility class or `[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`), keeping it scrollable so it can still be driven.
3. **Reverse the sync direction on 4.2** — scrolling the enrichment panel (drag, wheel, trackpad) sets `ledgerScrollRef.current.scrollTop`; the ledger's own wheel/scroll events still update the enrichment panel, so both sides stay in lockstep. The existing wheel-forwarding (`onWheelScroll`) stays.
4. **Steps 4.1 and 4.3 unchanged** — on those steps the enrichment panel isn't rendered, so the ledger keeps its current scrollbar exactly as today.

## Verification
- `npx tsgo --noEmit -p tsconfig.app.json`
- Playwright at 1584×1024 and 1376×1011: on 4.2 the scrollbar appears at the right edge, none between the panels; wheel over either half scrolls both; row alignment ledger↔enrichment holds while scrolled; 4.1 and 4.3 look unchanged.
