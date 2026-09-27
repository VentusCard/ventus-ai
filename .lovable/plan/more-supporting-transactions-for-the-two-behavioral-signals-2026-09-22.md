# More supporting transactions for the two behavioral signals

On the Ricky slide (4.2), the two internal behavioral pillars — "Bi-weekly advanced tennis" and "Annual Hawaiian vacation" — currently draw on a narrow set of merchants: tennis evidence is mostly the same club plus one pro shop, and the Hawaii evidence is a single Maui trip plus one later flight.

## What changes

Add roughly 14 new supporting transactions to Ricky's ledger, spread across the existing date range so they interleave naturally with the other activity.

Tennis (more merchant and rail variety):
- Court reservation app charge
- Private coaching lesson paid by Zelle to a coach
- Racquet restringing at a specialty shop
- Tournament entry fee
- Tennis apparel/shoe purchase at a different retailer
- Annual club dues paid by check
- Indoor court booking during winter months

Hawaii (a second trip and a wider trip footprint):
- Second island trip in a different season: airfare, hotel, and a luau/activity booking
- Airport lounge and in-flight purchases
- Snorkel/surf rental and a local coffee farm tour
- Travel insurance paid by ACH ahead of the trip

Each new row keeps the same raw-descriptor style, realistic amounts, correct MCC codes where the rail is a card, and no MCC for ACH/check/wire/Zelle rows.

## Technical notes

- Single file: `src/lib/deckmoRickyTransactions.ts`. New entries follow the existing `RickyTransaction` shape with sequential ids and are inserted in descending date order so the roller stays chronological.
- Tagged via `signal(RICKY_SIGNAL_LABELS.tennis)` / `signal(RICKY_SIGNAL_LABELS.hawaii)`, so the 4.2 pill filtering and highlight colors pick them up with no component changes.
- No changes to the ledger roll animation, pill behavior, or any other slide.
