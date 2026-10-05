# Center the 4.1 ledger, then move it left on 4.2

## Experience
- On slide 4.1, show the transaction ledger at its existing width, centered within the card.
- When advancing to slide 4.2, smoothly move that same ledger to the left without changing its width, column positions, row heights, or scroll position.
- Reveal the enrichment columns in the newly opened right side as the ledger moves left.
- Keep one shared table and one scrollbar at the far-right edge of the card; do not reintroduce a middle scrollbar.
- Leave slide 4.3 unchanged.

## Technical approach
- Keep the existing shared row data and single scrolling container for 4.1 and 4.2.
- Give the ledger a fixed proportional width matching its current 4.2 left panel.
- Position that ledger wrapper centrally on 4.1 and align it to the left on 4.2 using a transform/position transition, rather than changing grid tracks or scaling.
- Keep enrichment content mounted in the right-side region but hidden and non-interactive on 4.1; fade/cascade it in on 4.2 after the ledger begins moving.
- Preserve the card-level right-edge scrollbar in both steps.

## Verification
- At 1590×1024 and 1376×1011, compare the ledger header and first rows between 4.1 and 4.2: widths, heights, and internal column coordinates must match exactly.
- Confirm the only visual movement is the ledger shifting from center to left and the enrichment area appearing.
- Scroll both slides and confirm one right-edge scrollbar controls all rows.
- Confirm 4.3 still runs its existing rolling-ledger and signal-pill sequence.
