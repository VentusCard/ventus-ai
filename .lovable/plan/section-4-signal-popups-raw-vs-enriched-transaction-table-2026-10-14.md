# Section 4 signal popups: raw vs enriched transaction table

## Goal
In the Section 4 signal-pill popups, make each supporting transaction show a clear side-by-side of the **original raw transaction** and the **enriched output** — at most two rows per transaction.

## Current state
`EnrichedRow` in `src/components/deckmo/RickySignalStory.tsx` renders each supporting transaction as an enriched card (clean merchant, amount, date/source, MCC label, recurring chip) with the raw bank string only as a small truncated mono line underneath — easy to miss.

## Changes
All in `src/components/deckmo/RickySignalStory.tsx`:

1. **Restructure `EnrichedRow` into a two-column mini-table** per transaction:
   - **Left column — "Original"**: the raw bank string in monospace (`transaction.description`, e.g. `ACH DEBIT MARCUS BY GOLDMAN SACHS SAVINGS ID 091726`), with date and rail (`transaction.source`) beneath it.
   - **Right column — "Enriched"**: the cleaned merchant name, amount, category chip (`mccLabel` + MCC code, or Income/Transfer fallback), and Recurring/One-off chip — the same enrichment data shown today.
2. **Column headers**: add a one-time header row above the list ("Original transaction" / "Enriched output") so the before/after mapping is explicit; keep the existing "Supporting transactions · enriched (N)" heading.
3. **Density cap**: each transaction occupies at most two lines — raw string truncates with ellipsis (full string on hover via `title`), enriched side wraps to one chip line. The list stays scrollable inside the popup as today.
4. **Styling**: strict light theme, existing deck tokens (`border-deck-rule`, `text-deck-muted`, `text-deck-navy`); a thin vertical divider between the two columns. No new colors, no dark utilities.

## Untouched
- Popup width (760px), family colors, open/close behavior, outside-evidence block, pill styling, 4.1/4.2 reveal, navigation.
- No data changes — everything derives from the existing `RickyTransaction` fixture.

## Verification
- Run the deck test suite and typecheck.
- Playwright at 1691×1011 and 1376×1011: open a Financial pill popup, confirm each transaction shows raw string on the left and enriched output on the right, max two lines per transaction, no overflow.
