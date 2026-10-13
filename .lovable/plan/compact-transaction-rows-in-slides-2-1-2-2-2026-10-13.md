# Compact transaction rows in slides 2.1–2.2

- Keep the expandable Cards, ACH, Checks, Wire, and Zelle blocks, with Cards open first and one rail open at a time.
- Replace each expanded transaction’s stacked description and labeled details with **one compact horizontal row per transaction**, like the earlier ledger.
- Show a shared heading row within each expanded rail, with columns appropriate to that rail’s data structure. Keep raw descriptions in monospace and amounts aligned to the right.
- Preserve the existing representative transactions, extracted fields, panel dimensions, outside-events reveal, and expansion state across 2.1 → 2.2. Slides 2.3–2.5 remain unchanged.

## Technical scope
- Update `src/components/deckmo/RickyRailAccordion.tsx` only; continue using the existing rail-group helper and transaction fixture.
- Use stable column widths and truncate long descriptors with the full text available on hover, preventing wrapped multi-line transaction rows.

## Verification
- Check every rail on slides 2.1 and 2.2 at the current viewport and a wider desktop size: one row per transaction, readable headings, visible amounts, no horizontal overflow.
- Confirm rail selection persists through the slide transition and later enrichment slides remain unchanged.
- Run the existing rail-group tests and check preview errors.