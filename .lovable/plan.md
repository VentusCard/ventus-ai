# Section 4 popups: adopt the /demo enrichment table structure

## Goal
Replace the two-column card layout just added to the Section 4 signal-pill popups with the same **table structure** used by the /demo enrichment table (`ExecDemoEnrichmentTable`): a real table with a two-tier grouped header and one row per transaction.

## /demo structure to mirror
- **Tier 1 group headers**: "Raw Transaction · as received from bank feed" spanning the raw columns, separated by a heavier border from "Enriched output" spanning the enriched columns.
- **Tier 2 column headers**: one small uppercase header per column.
- **Body**: one row per transaction, cells aligned under their columns, raw side divided from enriched side by a vertical rule.

## Changes
All in `src/components/deckmo/RickySignalStory.tsx` (`EnrichedRow` + the supporting-transactions block):

1. **Render a real `<table>`** inside the popup instead of the current two-column `<ul>` cards.
2. **Tier 1 header**: "Raw Transaction · as received from bank feed" (left group) and "Enriched output" (right group), matching the /demo wording, with a heavier border between the groups.
3. **Columns** (adapted to the Ricky fixture's fields, which have no pillar/subcategory data):
   - Raw group: **Date**, **Source**, **Description** (full raw bank string, monospace, truncated with hover tooltip), **Amt** (right-aligned).
   - Enriched group: **Merchant** (cleaned name via existing `cleanMerchant`), **Category** (`mccLabel` + MCC code, or Income/Transfer fallback), **Freq** (Recurring/One-off).
4. **One row per transaction** — single line per cell, truncation with `title` tooltips, keeping the popup compact and scrollable as today.
5. **Styling**: strict light theme using deck tokens (`border-deck-rule`, `text-deck-muted`, `text-deck-navy`, muted header backgrounds); no dark utilities, no new colors. Skip the /demo blue gradient/shimmer on the enriched header — keep the deck's quiet enterprise look while copying its structure and wording.

## Untouched
- Popup width, family colors, open/close behavior, key details, merchants, monthly payments, outside-evidence block, pill styling, 4.1/4.2 reveal, navigation.
- No data changes — everything derives from the existing `RickyTransaction` fixture.

## Verification
- Run the deck test suite (`bun test scripts/`) and typecheck.
- Playwright at 1691×1011 and 1376×1011: open a Financial pill popup, confirm the two-tier table header, one row per transaction, raw left / enriched right, no horizontal overflow.
