# One-line row for the vending-machine confirmation transaction

## Goal

Every row in the Recent transactions list on the Immediate Value slide is exactly one line — including the "JFK Vending Machine?" confirmation row, which gets a soft yellow background instead of the Confirm label. The amber "Confirm" / green "Confirmed" chip and its second line disappear from the collapsed row; confirming still happens inside the expanded detail.

## Changes

All in `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`:

1. **Collapsed row — single line for every transaction**
   - Delete the `isConfirm` second line (lines 96–106: Confirm/Confirmed chip + rail chip + amount).
   - Remove the `!isConfirm &&` guards on the amount and rail chip (lines 93–94) so all rows render: date · clean name · amount · rail chip, one line.
   - Keep the trailing "?" on the name while unconfirmed (`JFK Vending Machine?`); after the customer confirms inside the detail, the name settles to "JFK Vending Machine" (existing `confirmed` logic already does this).
   - Remove the smaller `text-[11.5px]` confirm-row override so the name matches every other row.

2. **Yellow background for the confirmation row**
   - The wrapper row of the confirmation transaction (unconfirmed) gets a soft yellow background — `bg-amber-50` with `border border-amber-200` (or rounded highlight consistent with the phone list) — so it stands out as "needs your look" without any label.
   - After confirming, the row returns to the standard white background (same rule as the "?" removal).

3. **Expanded detail — unchanged behavior**
   - Keep the raw statement ("365 RETAIL MARKETS TROY MI", struck through), the Troy, MI merchant-category line, pattern, explanation, and the "Yes, that's right" / "No, something else" buttons.
   - Keep the post-confirmation thank-you line.
   - Remove the now-unused `Check` import only if nothing else references it (the Confirmed chip is the only user).

4. **No other changes**
   - No data or copy changes in `deckmoScript.ts` (the `needsConfirmation` flag stays — it drives the expanded buttons and the "?" suffix).
   - Row heights, icons, expand animation, reduced-motion behavior, and all other slides untouched.

## Verification

- `bunx tsgo --noEmit` clean.
- Playwright at 1540×855 and 1024×768: all seven rows are one line each; the vending row reads "Today · JFK Vending Machine? · $4.75 · CARD"; expanding shows the confirm buttons; clicking "Yes, that's right" removes the "?" on collapse; no page errors.
