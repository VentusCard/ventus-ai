# Transaction detail screen in the phone mockup

Today, tapping a transaction expands a small panel under the row. Replace that with a full transaction detail screen inside the phone, the way a real banking app pushes a detail page.

## Behavior

- Tapping any row slides in a detail screen that fills the phone body.
- A back arrow and "Transaction" header return to the list; the list keeps its scroll position.
- Only one screen is visible at a time; the bottom tab bar stays in place.
- Deck navigation is unaffected: taps inside the phone do not advance the slide, and the slide's other beats still work.

## What the detail screen shows

1. **Header block** — purchase icon, clean merchant name, amount, date, rail chip.
2. **Details** — original statement text (shown as the raw descriptor it replaced), category, payment rail, account, location where relevant.
3. **Checks** — short confirmation lines the system already ran, e.g. recognized merchant, familiar location, matches a recurring pattern. Each with a check mark; anything unresolved reads as a question instead.
4. **Suggestions** — the pattern and plain-language explanation already written for each transaction, plus the price-change note where it applies.
5. **Confirm** — for the JFK vending transaction, the "Yes, that's right / No, something else" choice lives here; after answering, the screen shows the confirmation state and the list row drops its yellow highlight and question mark. Other transactions keep a simple "Yes, that's mine" action.

## Technical notes

- Change is contained to `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`: swap the inline expand grid for a `selected` index and a detail view rendered in place of the list, with a translate-x transition and reduced-motion fallback.
- Checks are derived from existing fields in `DECKMO.immediate.activity` (`meta`, `pattern`, `explanation`, `needsConfirmation`); no new data fields unless a transaction needs a location line, which would be a small optional field in `src/lib/deckmoScript.ts`.
- Keep deck light-theme tokens and existing rail tones; verify at 1024x768, 1540x855, and 1920x1080.
