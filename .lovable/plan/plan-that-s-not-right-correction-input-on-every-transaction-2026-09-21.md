# Plan: "That's not right" correction input on every transaction

## Goal
Every transaction detail screen in the Immediate Value phone mockup (not just the JFK vending row) gets a "No, that's not right" action. Tapping it opens a small input where the customer suggests the correct merchant/description; submitting acknowledges it and relabels the row.

## Changes

`src/components/deckmo/DeckmoRecentTransactionsTab.tsx`:

1. **State**: add `corrections: Record<number, string>` (submitted suggestion per row) and `correctionOpen: number | null` (which row has the input expanded).
2. **Detail screen action row** (bottom of every transaction's detail):
   - Non-confirmation rows currently show only "Yes, that's mine" — add an outline "No, that's not right" button next to it.
   - The JFK confirmation row keeps its two buttons, but "No, something else" now opens the same correction input instead of immediately marking "no".
3. **Correction input** (appears inline under the action row when opened):
   - Small prompt: "What should this be?" with a text input (placeholder "e.g. JFK Vending Machine") and a "Send" button.
   - Input capped (e.g. 80 chars), trimmed, and ignored if empty.
   - On submit: store the suggestion, close the input, show "Thanks — we'll review your suggestion." and, for confirmation rows, mark the row answered (`"no"`) so the yellow highlight and `?` clear in the list. For regular rows, the list row shows the suggested name with an amber "Review" chip so the feedback is visible.
4. **Back navigation**: resetting `selected` also closes any open input; suggestions persist per row during the session (in-memory state only, no persistence — it's a demo).
5. All new elements stop click propagation so they don't advance the deck; light-theme tokens only; reduced-motion safe.

## Verification
- Open a normal row (e.g. Spotify), tap "No, that's not right", type a suggestion, submit — list row shows suggested name.
- Open the JFK vending row, use "No, something else", submit a suggestion — `?` and highlight clear.
- Typecheck/build clean; verify at 1540×855.
