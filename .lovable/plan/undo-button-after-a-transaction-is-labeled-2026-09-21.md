# Undo button after a transaction is labeled

## Goal
After the customer labels a transaction in the phone mockup (taps "Looks Good" / "Yes, that's right", or sends a correction suggestion), show an **Undo** button that reverts the label and restores the transaction to its unanswered state.

## Changes — `src/components/deckmo/DeckmoRecentTransactionsTab.tsx` only

1. **Undo action on the detail screen**
   - Where the acknowledgement line currently renders ("Thanks — this transaction is now labeled." / "Thanks — we'll review your suggestion."), add a small outline **Undo** button (with an Undo2 icon) next to the text.
   - Clicking it clears both `confirmations[selected]` and `corrections[selected]` for that transaction, which automatically:
     - restores the "Looks Good" / "No, that's not right" buttons,
     - removes the "Review" chip and suggested name from the list row,
     - for the JFK row, brings back the `?` on the name and the amber highlight.

2. **Keep everything else unchanged**
   - No changes to beats, navigation, list rows, or copy. Undo is per-transaction and lives only in the detail view's action area.

## Verification
- Playwright at 1540×855: label the JFK transaction → Undo appears → click Undo → buttons and `?`/amber state return. Same check for a normal transaction (Looks Good → Undo) and for a correction (suggestion + Review chip → Undo clears both).
- `npx tsgo --noEmit -p tsconfig.app.json` clean; build log OK.
