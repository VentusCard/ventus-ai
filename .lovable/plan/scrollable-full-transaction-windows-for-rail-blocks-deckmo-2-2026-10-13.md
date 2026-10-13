# Scrollable full-transaction windows for rail blocks (deckmo 2.1–2.2)

## What changes

Each expanded rail block in Ricky's transaction accordion (beats 2.1 and 2.2) currently shows at most 3 sample transactions. It will instead open a scrollable window that contains the **entire list** of that rail's transactions, one compact row per transaction, so the presenter can scroll through everything inside the block.

- The expanded block's table area becomes its own vertical scroll window with a capped height (clamped to available panel height), keeping the other rail headers visible below so any rail can still be expanded in one click.
- The existing per-rail columns stay exactly as they are (Cards: date, card source, raw descriptor, MCC, amount; ACH: date, descriptor, direction, identifier, amount; Checks, Wire, Zelle unchanged).
- The rail header gets a small transaction count (e.g. "28 transactions") so it's clear the window holds the full list.
- Nothing else changes: panel size and position across 2.1→2.2, the outside-events panel on 2.2, beats 2.3–2.5, Meet Ricky header, and wording stay as-is. The open rail and its scroll position continue to persist across the 2.1→2.2 transition since the accordion stays mounted.

## Files touched

- `src/lib/deckmoRickyRailGroups.ts` — stop capping examples at 3; expose all transactions per rail (keep the variant-coverage ordering logic so the first rows shown still cover both card sources / both ACH directions, then the rest in original order).
- `src/components/deckmo/RickyRailAccordion.tsx` — wrap the expanded table in an inner scroll container (`overflow-y-auto`, light scrollbar, max height clamped to viewport height); add the count to the rail header; row rendering unchanged.
- `scripts/deckmoRickyRailGroups.test.ts` — update tests to assert full counts per rail and preserved ordering (variant coverage first, then original order).

## Verification

- `bun test scripts/deckmoRickyRailGroups.test.ts` passes.
- Playwright at 1377×842 and 1691×1011: Cards block opens with a scrollable full list; scrolling inside reaches every transaction; expanding another rail swaps the window; the open block and its scroll position survive the 2.1→2.2 transition; beats 2.3+ render unchanged.
- Check build log for errors.
