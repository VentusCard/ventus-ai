# Fix: correction input stays open after confirming a transaction

On the deckmo phone's transaction detail screen (beat 5.4 JFK row, and any row), tapping "No, that's not right" opens the "What should this be?" input card. Tapping "Yes, that's right" / "Looks Good" afterwards records the confirmation but leaves the input card visible.

## Root cause

In `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`, the confirm button's `onClick` only calls `setConfirmations(...)`. It never resets `correctionOpen`, and the form renders whenever `correctionOpen === selected && !corrections[selected]` — so the card stays.

## Change

One-file edit in `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`:

- In the confirm button `onClick` ("Yes, that's right" / "Looks Good"), add `setCorrectionOpen(null); setDraft("");` alongside the existing `setConfirmations(...)` — matching the cleanup already done by Undo, Back, and form submit.

No other behavior changes: the thank-you line, Undo flow, correction submission, beat navigation, and list row states all stay as-is.

## Verification

- Beat 5.4: open JFK detail → "No, that's not right" (input appears) → "Yes, that's right" → input card gone, thank-you line with Undo shows.
- Regression: same flow on a normal row with "Looks Good"; Undo still restores both buttons.
- Build log clean.
