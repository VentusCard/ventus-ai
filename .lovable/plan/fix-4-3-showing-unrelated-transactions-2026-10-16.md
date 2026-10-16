# Fix 4.3 showing unrelated transactions

## Cause (confirmed)
When the pop-up became slide 4.3, the filter that picks each signal's transactions started comparing the signal name to itself. Every transaction matched, so each signal listed all 108 card, ACH, check and wire transactions instead of only its own. The transaction data itself is correct; for example, the home purchase has 6 linked transactions.

## Fix
- In the 4.3 detail view, filter supporting transactions by the selected signal again. Each signal will show only its linked transactions: home purchase 6, Goldman Marcus 9, tennis 18, and so on.
- Signals that build their list differently are not affected, because they don't use this filter: surplus/idle cash, general spending, the customer profile, and external signals.

## Technical details
- `src/components/deckmo/RickySignalStory.tsx` line 33: rename the inner arrow parameter so the check reads `transaction.signals.some((signalLabel) => signalLabel === label)`.
- Add a small test that pulls the evidence filter into an exported helper, `rickySignalEvidence(label)`. It checks that the home purchase returns exactly the 6 linked transaction IDs, and that Marcus returns 9.
- Check in the browser at 1691×842: open 4.3 for the home purchase and for Marcus, and confirm the transaction counts and rows.
