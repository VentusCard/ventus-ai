# New slide 4.2: every transaction enriched and labeled

Add a new beat to "Meet Ricky" that looks like the /demo and TEPilot enrichment table. Each of Ricky's raw transactions appears next to its enriched labels. The current 4.2 (signal pills plus the rolling ledger) moves to 4.3.

## What the audience sees on 4.2
- The same Meet Ricky header and layout area, with the left side now a full-width enrichment table.
- Each row shows: raw descriptor (monospace), amount, date, source/rail chip, an arrow, then the enriched columns:
  - Clean merchant name (for example "WHOLEFDS MKT 10267..." becomes "Whole Foods Market")
  - Pillar pill, using the existing 12-pillar colors
  - Category and subcategory chips
  - Spending tier (Budget / Standard / Premium)
  - Frequency (Weekly / Monthly / Occasional / Annually / One-Time)
  - Confidence badge
  - Signal tag when the row supports one of Ricky's signals (tennis, Hawaii, home, brokerage, business, betting)
- Rows appear with a quick cascading "enriching" reveal: raw text first, then the labels fill in. The table then scrolls inside its frame.
- A small header strip shows "92 transactions · 6 rails · 100% enriched". It contains no spend totals, per the copy rules.

## Navigation
- Meet Ricky goes from 2 beats to 3: 4.1 ledger, 4.2 enrichment table (new), 4.3 signals with roll and highlights (the old 4.2).
- The ledger roll animation moves its trigger to 4.3 so it keeps its current behavior.
- Table of contents and other slides are unchanged.

## Technical details
- `src/lib/deckmoRickyTransactions.ts`: add an `enrichment` field to each of the 92 rows (normalizedMerchant, pillar, category, subcategories, tier, frequency, confidence). This is hand-curated static data with no AI calls, so the slide is deterministic.
- `src/lib/deckmoScript.ts`: change ricky `steps` from 2 to 3, and add a beat caption for the new beat, such as "Every transaction, enriched" / "Merchant, pillar, category, tier, frequency, and confidence for every row".
- `src/components/deckmo/DeckmoDeck.tsx`: in the Ricky scene, render a new `RickyEnrichmentTable` component when `step === 1`. Shift the existing step logic: the roll condition changes `step === 1` to `step === 2`, and signal and highlight conditions shift by one.
- The new component lives at `src/components/deckmo/RickyEnrichmentTable.tsx` and reuses `PILLAR_COLORS` and the tier/frequency/confidence badge styling from `DemoEnrichmentTableView`. It uses a strict light theme.
- Verification: Playwright at 1566×855 and 1376×1011 checks that 4.1, 4.2 and 4.3 render, the table fits above the footer, the roll still plays on 4.3, and the build is clean.
