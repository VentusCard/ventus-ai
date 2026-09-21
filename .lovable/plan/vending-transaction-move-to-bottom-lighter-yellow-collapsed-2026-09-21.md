# Vending transaction: move to bottom, lighter yellow, collapsed by default

## Goal

On the Immediate Value slide's Recent transactions tab, the vending confirmation transaction moves from the top of the list to the bottom, its yellow highlight becomes lighter, and the list opens with no row expanded.

## Changes

### 1. `src/lib/deckmoScript.ts` — reorder the activity array
- Move the vending confirmation entry (raw `365 RETAIL MARKETS TROY MI`, `clean: "JFK Vending Machine"`, `needsConfirmation: true`) from the first position to the last position in `DECKMO.immediate.activity`. No field values change; the date label "Today" stays accurate at the bottom since all other entries are past dates.

### 2. `src/components/deckmo/DeckmoRecentTransactionsTab.tsx` — lighter highlight + collapsed default
- `expanded` initial state: `0` → `null` so no row is expanded on load (rows still expand on tap).
- Lighter yellow on the unconfirmed vending row: change the wrapper classes from `border-amber-300 bg-amber-100` to `border-amber-200 bg-amber-50` (soft yellow tint, close to white).
- Nothing else changes: single-line rows, "?" suffix, expand/collapse animation, confirm buttons, thank-you lines, tab bar, and all other slides stay as-is.

## Verification

- `bunx tsgo --noEmit` clean, build OK.
- Playwright at 1540×855: the list opens fully collapsed; the vending row is the last row and reads "Today · JFK Vending Machine? · $4.75 · CARD" with the lighter yellow background; tapping it still shows the confirm detail and "Yes, that's right" resolves the row (highlight and "?" removed). No page errors.
