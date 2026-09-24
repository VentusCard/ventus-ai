# Redistribute and enlarge the 5 signal families in beat 3.2 only

## Current state
- The five families (Spending Habits, Life Events, Financial Signals, Demographic, Risk) render inside the synthesis card in `LivingView` (src/components/deckmo/DeckmoDeck.tsx, line ~255) as `grid grid-cols-5 gap-x-6` with a 10px dot and 15px bold label.
- Each item sits left-aligned inside its 1/5 column, so the row reads cramped toward the left; labels are small relative to the card width.
- The same row element is shared between 3.2 (families centered, no questions) and 3.3 (families move up, questions reveal below) — its layout already switches on the `questionsRevealed` state.

## Change
In `LivingView`'s synthesis card only:
1. **Redistribute at 3.2** — when the questions are not yet revealed (beat 3.2), switch the families row from a 5-column grid to a single flex row with `justify-between` spanning the full card width, so the five families spread evenly edge-to-edge (first flush left, last flush right).
2. **Slightly bigger at 3.2** — at beat 3.2 only, increase the dot from 10px to 12px and the label from 15px to ~18px (with responsive step-downs preserved so nothing wraps or clips).
3. **3.3 unchanged** — when the questions reveal (beat 3.3), the row reverts to the current size and distribution, since both beats share the same element; sizing is applied conditionally on the `questionsRevealed` state.

## Verify
- Playwright at 1540×855 and 1024×768: navigate to 3.2 and 3.3, confirm the five families are spread across the card width and larger at 3.2, revert to the current smaller size at 3.3, no wrap/clip at either beat.
- Build/typecheck clean.
