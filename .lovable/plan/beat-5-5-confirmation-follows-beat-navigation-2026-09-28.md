# Beat 5.5 confirmation follows beat navigation

## Problem
On slide 5, beat 5.5 shows the JFK transaction in the confirmed state. But once it confirms, it stays confirmed forever: arrowing back to 5.4 still shows "Thanks — this transaction is now labeled." instead of the unanswered "Yes, that's right / No, that's not right" state.

## Root cause
In `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`, the effect on `[step, active]` sets `confirmations[jfkIndex] = "yes"` when `step >= 4`, but never removes it when `step < 4`.

## Change (one file: `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`)

In the existing `[step, active]` effect, make the confirmation beat-driven in both directions:

- `step >= 4`: set `confirmations[jfkIndex] = "yes"` (unchanged).
- `step < 4`: delete `confirmations[jfkIndex]` (and any `corrections[jfkIndex]` / `supportChats[jfkIndex]`) so the JFK detail returns to its unanswered state — amber highlight, `?` on the name, both action buttons.

Result:
- 5.4 → 5.5 confirms; 5.5 → 5.4 reverts; replaying forward confirms again.
- Manual taps still work within a beat (confirm/Undo/correction), but any beat change re-syncs the JFK row to the beat's intended state.
- Other transactions' manual confirmations are untouched.

## Verification
- Playwright at 1376×1011: 5.4 shows unanswered JFK detail → 5.5 confirmed → back to 5.4 unanswered → forward to 5.5 confirmed again.
- Regression: manual "Yes, that's right" on 5.4, then Undo, still works.
- `bunx tsgo --noEmit` clean; build log OK.
