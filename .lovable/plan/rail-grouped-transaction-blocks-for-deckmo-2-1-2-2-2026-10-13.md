# Rail-grouped transaction blocks for /deckmo 2.1–2.2

## What changes
- Replace the full transaction list on **2.1 and 2.2 only** with five expandable blocks: **Cards, ACH, Checks, Wire, and Zelle**. Cards combines Ricky’s Premium Card and Cashback Card transactions, while preserving their source labels in the examples.
- **Cards opens first.** Clicking another rail opens that block and closes the previous one; clicking the open block collapses it.
- Show a few representative real transactions from Ricky’s existing dataset in each expanded block, rather than another long ledger.
- Make each rail’s different structure immediately visible through its own field headings and compact examples:
  - **Cards:** date, card source, raw merchant descriptor, MCC, and amount.
  - **ACH:** date, raw ACH descriptor, and amount, with debit/credit direction and embedded identifier separated out where the descriptor contains them.
  - **Checks:** date, check number where present, payee/descriptor, and amount.
  - **Wire:** date, wire descriptor, reference where present, and amount.
  - **Zelle:** date, recipient/payment descriptor, and amount.
- Keep raw descriptors visible in monospace. Do not add MCC placeholders to non-card rails, or invent identifiers and metadata absent from the source transactions.

## Preserve the presentation
- Keep the Meet Ricky profile, surrounding panel dimensions, supporting wording, slide navigation, and outside-events panel unchanged.
- Keep the same rail-block view mounted across 2.1 and 2.2: the selected block and scroll position persist while the panel moves left and the outside events appear.
- Keep the strict light theme and existing rail colors, with compact chevrons and clear selected/expanded states.
- Leave **2.3–2.5 unchanged**, including the full enrichment table and signal interactions. At 2.3 the rail overview gives way to the existing enriched table; do not force every block open or briefly flash the full raw list during the handoff.

## Technical details
- Replace only the raw-list content in `Visibility` in `src/components/deckmo/DeckmoDeck.tsx` with a focused deck-specific rail accordion.
- Derive groups and representative examples from `RICKY_TRANSACTIONS`; retain original transaction IDs, descriptions, amounts, source assignments, and signal associations. No fixture, enrichment, or service changes.
- Use safe extraction for metadata embedded in descriptors; fall back to the unchanged descriptor when a field cannot be extracted reliably.
- Use accessible expansion controls with `aria-expanded` and keyboard interaction; keep the content inside the existing panel’s scroll area.

## Verification
- Add and run small tests for five-rail grouping, combining both card sources, representative-example selection, and missing-field handling without fabricated metadata.
- Check /deckmo at **1375×842** and **1691×1011**: Cards starts open, selecting ACH changes the visible fields, other rails expand correctly, and the open rail persists between 2.1 and 2.2.
- Confirm no internal right-side gap, clipped fields, overlapping text, or panel-height jumps; verify the outside-events reveal and navigation into the unchanged 2.3–2.5 views.
- Check the preview for build and runtime errors.