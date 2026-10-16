# Follow-ups to the Section 4 rounding pass

## 1. Income title matches the new figures
- Rename the income signal title from "Stable $22–26K monthly income" to "Stable $23–25K monthly income", so the title, pill and detail page all match Ricky's paychecks ($23,000–$25,000 a month).
- No other deck slide still uses the old tennis, Hawaii, media, home or cash-flow figures, so nothing else needs to change.

## 2. Small amounts no longer overstated
- Amounts under $100 in the detail-page transactions table round to the nearest $10 instead of a $100 minimum (e.g. $28 → $30, $72 → $70, $22.99 → $20).
- $100–$9,999 still rounds to the nearest hundred, $10,000+ to the nearest thousand, $1M+ to one-decimal millions.

## 3. Out of scope (unchanged)
- Phone mockup scenes and the slide 2.1/2.2 transaction lists keep exact amounts, because they show the raw bank data before Ventus AI.

## Technical details
- `RICKY_SIGNAL_LABELS.income` in `src/lib/deckmoRickyTransactions.ts`. The label is the lookup key everywhere, so every reference updates automatically; adjust any test that hardcodes it.
- `roundDisplayDollars` in `src/lib/deckmoDisplayMoney.ts`: under $100 → nearest $10, minimum $10 for non-zero amounts.
- Update `scripts/deckmoDisplayMoney.test.ts`: $28 → "$30", ($72.00) → "($70)", plus a test that the income title reads "$23–25K".
