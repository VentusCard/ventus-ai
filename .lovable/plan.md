# Slide 4.2: extend the 4.1 table in place

## Goal
Slide 4.2 shows the exact 4.1 ledger table — same header, same rows, same position — with the enrichment columns appearing to its right. No "Enriched ledger · 91 transactions · 6 rails · 100% enriched" strip, and nothing on the left side moves when the new columns appear.

## Changes

**`src/components/deckmo/DeckmoDeck.tsx` (Ricky scene)**
- Render ONE shared table for steps 4.1 and 4.2 instead of swapping in a separate `RickyEnrichmentTable` component. The date / source / transaction / amount header and rows render identically on both steps.
- On step 4.1 the table uses the current four-column grid. On step 4.2 the grid gains the six enrichment columns (Merchant, Pillar, Category · Sub, Tier, Freq, Conf) appended on the right; the enrichment cells cascade in with the existing stagger animation.
- The three fixed-width columns (Date 54px, Source 94px, Amount 90px) keep their exact pixel positions on both steps, so the left side does not shift. Only the flexible Transaction column narrows to make room (its text truncates a little earlier, in place).
- Step 4.3 keeps the current two-panel layout (rolling ledger + signal pills) unchanged.

**`src/components/deckmo/RickyEnrichmentTable.tsx`**
- Remove `EnrichmentHeaderStrip` (the "Enriched ledger" row) and the standalone default table export. Keep `EnrichmentCells` and `EnrichmentColumnHeaders`, which the shared table in DeckmoDeck now uses directly.

## Verification
- Playwright at 1566×855 and 1376×1011: confirm 4.1 is pixel-identical to before, 4.2 shows the same table with enrichment columns appearing on the right (left columns unmoved, no strip), and 4.3 still plays the roll + signal pills.
- Typecheck + build log clean.
