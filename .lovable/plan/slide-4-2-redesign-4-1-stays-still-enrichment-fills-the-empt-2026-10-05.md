# Slide 4.2 redesign: 4.1 stays still, enrichment fills the empty right side

## What's wrong today
Going from 4.1 to 4.2 swaps in a different table, so the ledger visibly jumps:
- Rows get taller on 4.2 (about 35px to 41px). The pillar pill takes on the page's tall default line height, so fewer rows fit and everything slides down.
- Every row moves about 3px left, because 4.2 rows are missing the 3px left border that 4.1 rows have.
- The table is laid out across the full width instead of 4.1's left/right split, so how wide each column is depends on the screen size and doesn't match 4.1.

## New approach: 4.1 is the base and stays put
- 4.1 and 4.2 render **the same ledger element**, using the same left/right split as 4.1. The left panel (Date, Source, Transaction, Amount) keeps the same markup, padding, row borders and row height on both steps, and nothing is re-mounted between them.
- 4.1's right panel is currently empty. On 4.2 the enrichment columns fill that space: Merchant, Pillar, Category · Sub, Tier, Freq, Conf.
- Each row is one line that spans both panels, inside a single scroll area. Enrichment cells line up with their ledger row and scroll with it.
- The enrichment cells are capped so they can never be taller than the ledger row: single line, tight line height, chips truncate. Row height stays exactly what it is on 4.1.
- Enrichment cells cascade in row by row, the same way they do now. On 4.1 those cells don't render, so the right side looks just as it does today.
- 4.3 (rolling ledger plus signal pills) is unchanged.

```text
4.1  | Date | Source | Transaction        | Amount |                                   |
4.2  | Date | Source | Transaction        | Amount | Merchant | Pillar | Cat | Tier | Freq | Conf |
       ^ identical pixels on both steps            ^ fills the previously empty panel
```

## Technical details
- In `DeckmoDeck.tsx` (Ricky scene), steps 0 and 1 share one scroll container with header and rows laid out as `grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]`. The left half reuses the exact 4.1 cell grid classes (`grid-cols-[54px_94px_minmax(0,1fr)_90px]`, `px-5` equivalent, `border-l-[3px] border-l-transparent`, `py-2 pl-2`). The left half carries `border-r border-deck-rule` plus the `bg-deck-surface/50` tint, so the split line and shading match 4.1.
- The right half uses proportional, truncating tracks (for example `grid-cols-[1.3fr_1.15fr_1.4fr_0.6fr_0.7fr_0.45fr]`), so it fits the 0.92fr panel at both 1584 and 1376 widths.
- `EnrichmentCells`: every cell gets `leading-none` / `flex items-center` with no inline-block line boxes, which fixes the row-height growth. Keep at most one sub-category chip.
- The `RickyEnrichmentTable` default export gets removed or folded into the shared ledger. `EnrichmentCells` and `EnrichmentColumnHeaders` stay.
- Step 2 (4.3) keeps its current two-panel layout and the roll animation.

## Verification
- Playwright at 1584×855 and 1376×1011. Capture 4.1 and 4.2 and compare the bounding boxes of the first 10 ledger rows and of the header cells. Top, left, width and height must be identical.
- Visually confirm 4.2's enrichment columns fit without clipping, and that 4.3 still plays the roll with signal pills.
- Check the build log is clean.
