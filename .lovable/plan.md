# Redistribute and enlarge the 5 signal families in beat 3.2

## Current state
- The five families (Spending Habits, Life Events, Financial Signals, Demographic, Risk) render inside the synthesis card in `LivingView` (src/components/deckmo/DeckmoDeck.tsx, line ~255) as `grid grid-cols-5 gap-x-6` with a 10px dot and 15px bold label.
- Each item sits left-aligned inside its 1/5 column, so the row reads cramped toward the left; labels are small relative to the card width.

## Change
In `LivingView`'s synthesis card only:
1. **Redistribute** — switch the families row from a 5-column grid to a single flex row with `justify-between` spanning the full card width, so the five families spread evenly edge-to-edge (first flush left, last flush right).
2. **Slightly bigger** — increase the dot from 10px to 12px and the label from 15px to ~18px (responsive step-downs preserved for narrow/short viewports so nothing wraps or clips).
3. Keep the shared 3.3 behavior intact: the same row is reused when questions reveal (moves to the top of the card), so the bigger, redistributed row also appears at 3.3 — consistent with the request since it is the same element.

## Verify
- Playwright at 1540×855 and 1024×768: navigate to 3.2 and 3.3, confirm the five families are spread across the card width, larger labels, no wrap/clip, and the 3.3 transition still works.
- Build/typecheck clean.
