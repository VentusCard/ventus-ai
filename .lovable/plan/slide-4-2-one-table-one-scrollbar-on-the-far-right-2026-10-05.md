# Slide 4.2: one table, one scrollbar on the far right

## Why the middle scrollbar is still there
Slides 4.1 and 4.2 still use two separate scroll boxes, the ledger on the left and the labels on the right, kept in sync with code. The ledger's scrollbar was only hidden with CSS. Some browsers and OS settings (for example macOS with "always show scrollbars") still draw it. Hiding it more aggressively would stay fragile.

## The redesign
Slides 4.1 and 4.2 become a single table with a single scroll area that spans the full width of the card.

- Each row is one line across the whole card. The left half has the same ledger cells as today (Date, Source, Transaction, Amount), with the same tinted background and the divider line down the middle. The right half holds the enrichment labels.
- On 4.1 the right half of each row is empty, so the slide looks the same as now. On 4.2 the labels cascade in row by row, the same as now.
- There is only one scrollbar, at the far right edge of the card, on both 4.1 and 4.2. Nothing moves when you go from 4.1 to 4.2, and no scrollbar appears in the middle.
- The column header row stays pinned at the top while you scroll. Ledger headers sit on the left, label headers on the right.
- 4.3 (rolling ledger plus signal pills) and the external-evidence card stay exactly as they are.

## Technical details
- `DeckmoDeck.tsx` (Ricky scene): when `step < 2` and no external evidence is selected, render one container spanning both grid columns, `min-h-0 flex-1 overflow-y-auto scrollbar-light`.
  - Sticky header: `grid grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]`. The left cell uses the existing 4.1 header grid (`grid-cols-[54px_94px_minmax(0,1fr)_90px] gap-3`, `px-5`, `bg-slate-50`). The right cell renders `EnrichmentColumnHeaders` only on step 1.
  - Rows: the same two-column outer grid. The left cell keeps the exact 4.1 classes (`border-l-[3px] border-l-transparent py-2 pl-2`, `px-5` gutter, `bg-deck-surface/50`, `border-r border-deck-rule`). The right cell (`ENRICH_COLS`, `px-5`) renders `EnrichmentCells` on step 1 and nothing on step 0. Both cells share the row's bottom border, so the heights match by construction.
  - Leave a `py-2` spacer at the top and bottom of each half so the existing padding stays.
- Remove `ledgerScrollRef`, `enrichScrollRef`, `syncEnrichScroll`, `syncLedgerScroll` and the hidden-scrollbar classes. They are no longer needed.
- Step 2 keeps its current two-section layout (ledger section plus `SignalFamilyCard` section) unchanged.
- `RickyEnrichmentTable.tsx`: delete the `RickyEnrichmentPanel` scroller. Keep `EnrichmentCells`, `EnrichmentColumnHeaders` and `ENRICH_COLS` (exported).

## Verification
- Playwright at 1590x1024 and 1376x1011. On 4.1 and 4.2, check that the scroll area has exactly one scrollable element and that its right edge matches the card's right edge. Check that ledger row positions are identical between 4.1 and 4.2.
- Scroll on 4.2 and confirm the labels stay aligned with their ledger rows.
- Confirm 4.3 still plays the roll with signal pills, and that the build log is clean.
