## Goal
On `/demo` (Executive Demo), make the **third transaction row** of the **first demo customer** an MCC 5999 (Miscellaneous & Specialty Retail) transaction by **moving an existing MCC 5999 row up to position 3** — not editing or replacing the current third row.

## Context
- The first demo customer (`DEMO_CUSTOMERS[0]`, id `c1`) sources its raw transactions from `SAMPLE_CSV` in `src/lib/sampleData.ts` (starts line 220).
- The selection dialog and feed render rows in CSV order.
- Need to find an existing MCC 5999 row in `SAMPLE_CSV` and relocate it to be the 3rd data row (line 222 in current file). If none exists, find the closest miscellaneous-retail row already present and move it up; only as a last resort add a new row.

## Steps
1. Scan `SAMPLE_CSV` (lines 220–end of block) for any row with `,5999,` and pick the most plausible candidate.
2. If found: cut that row from its current position and re-insert it as the 3rd data row (immediately after the header and the first two existing rows). All other rows preserve their order.
3. If no MCC 5999 row exists in `SAMPLE_CSV`: report back to the user before changing anything, since the request is explicitly a move (not a create/edit).

## Out of scope
- No edits to row contents (merchant, amount, date, source, zip).
- No changes to other customers or to deals/pillars/persona summaries.