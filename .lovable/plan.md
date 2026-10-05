# Rework slide 4.2: extend the 4.1 ledger to the right

Slide 4.2 currently replaces the whole 4.1 layout with one wide table. Change it so 4.2 keeps the 4.1 two-panel layout: the raw ledger stays on the left, and the enriched columns extend into the right panel (where the signal families sit on 4.3), at the same scale as 4.1 — no zoom or scale changes.

## What changes on 4.2
- Left panel: the same raw ledger as 4.1 (date, source, transaction, amount), static — no roll, no highlights.
- Right panel: the enrichment columns for each row, aligned row-for-row with the ledger on the left: merchant, pillar pill, category + sub chips, tier, frequency, confidence.
- The Signal column is removed from the enrichment table entirely (header and row cells).
- The "Enriched ledger · 92 transactions · 6 rails · 100% enriched" strip moves into the right panel's header area.
- The cascading "enriching" reveal on the enriched columns stays.

## Technical details
- `src/components/deckmo/DeckmoDeck.tsx` (Ricky scene): replace the `step === 1 ? <RickyEnrichmentTable/> : grid` branch so the two-panel grid renders on all steps. On step 1 the left ledger renders without the roll class and the right section renders the enrichment columns instead of the signal families. Steps 2 (roll + signals) behavior is unchanged.
- `src/components/deckmo/RickyEnrichmentTable.tsx`: remove the Signal column (last column in `COLS`, the "Signal" header span, and the signal cell); re-balance the grid template so the remaining columns fill the right panel width. Refactor into a per-row enrichment strip that can sit beside a ledger row, plus keep the header strip.
- Row alignment: both panels use the same row height and vertical rhythm so raw row N lines up with enriched row N; both scroll together (single shared scroll container wrapping both panels, or matched overflow with synchronized scroll — simplest is one scroll container with a two-column grid per row).
- Strict light theme, no new colors.

## Verification
- Playwright at 1566×855 and 1376×1011: 4.1 unchanged, 4.2 shows ledger left + enrichment right with rows aligned and no Signal column, 4.3 roll and signal pills still work, table fits above the footer, build clean.
