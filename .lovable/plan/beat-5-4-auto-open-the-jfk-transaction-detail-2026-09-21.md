# Beat 5.4: auto-open the JFK transaction detail

On the Immediate Value slide, the phone currently always starts on the transaction list; the detail screen only opens when someone taps a row live.

## What changes

- When the presenter reaches the fourth beat of the Immediate Value slide (5.4), the phone automatically slides into the JFK Vending Machine transaction detail — the screen with the original statement text, checks, suggestion, and the confirm / "No, that's not right" actions.
- On beats 5.1–5.3 the phone shows the transaction list as it does today.
- Stepping back from 5.4 returns the phone to the list, so the beat can be replayed.
- Tapping rows manually still works on any beat, and the back arrow still closes the detail.

## Technical notes

- `DeckmoRecentTransactionsTab` gains a `step` prop; `BankdemoImmediate` in `DeckmoBankdemoScenes.tsx` passes its `step` through.
- An effect selects the JFK entry (the single `needsConfirmation: true` row in `DECKMO.immediate.activity`, located by lookup rather than a hard-coded index) when `step >= 3`, and clears the selection when `step < 3`.
- Manual selection inside a beat is preserved: the effect only fires on step changes, not on every render.
- The `steps: 4` count for the `immediate` beat in `deckmoScript.ts` stays unchanged.
