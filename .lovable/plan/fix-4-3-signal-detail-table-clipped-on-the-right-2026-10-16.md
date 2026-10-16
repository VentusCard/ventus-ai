# Fix: 4.3 signal-detail table clipped on the right

## Problem

On slide 4.3 (signal detail), the supporting-transactions table is 54px wider than the card that holds it at common desktop widths (verified live at 1691×1011):

- Card (`#ricky-story-detail`): x=122, right edge=1570
- Table: 1458px wide inside a 1404px scroll area — the last column (**Freq**) ends at x=1602, past the card edge, and only becomes visible with a hidden horizontal scroll.

Cause: the table is `table-fixed` with a fixed `min-w-[1458px]` and equally fixed column widths. The min-width is slightly larger than what the 4.3 slide layout offers (1560px slide minus page padding minus card padding).

## Fix

Single file: `src/components/deckmo/RickySignalStory.tsx` (the `RickySignalDetail` table).

1. Trim the fixed column widths and the table's `min-w-[1458px]` to a smaller total (~1393px):
   - Description 360 → 330
   - Merchant 260 → 240
   - Subcategories 230 → 215
   - Rail, Date, Amt, Category, Freq unchanged (120/88/120/170/110)
   - New min-width: 1393px, matching the trimmed colgroup sum.
2. Keep everything else as is: `w-full` + `table-fixed` already lets the table stretch to use any extra container width, and the existing `overflow-x-auto` still handles very narrow screens by scrolling (readable minimum widths preserved — no truncation of data).

## Verification

- Browser at 1691×1011: table scroll width ≤ container width; Freq column right edge inside the card; no horizontal scroll needed. Repeat at 1546×903 and 1280×900.
- Add a small check in `scripts/deckmoSignalStory.test.ts` asserting the colgroup widths sum equals the table min-width, so the two can't drift apart again.
- Run `bun test scripts` and the typecheck.

No copy, data, or navigation changes — layout only.
