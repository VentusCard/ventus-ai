# Add Two Subscription Rows to Recent Transactions

## Goal
Add two new transactions at the bottom of the Recent transactions list (below the JFK vending row) that showcase subscription intelligence — specifically the price-change capability.

## Changes

### 1. Data — `src/lib/deckmoScript.ts` (immediate.activity)
Append two entries after the vending row (list stays date-descending, vending is "Sep 15"):

**Row 1 — streaming price increase**
- date: "Sep 14", rail: "CARD", icon: "streaming"
- raw: "STREAMMAX*SUB 8881234"
- clean: "StreamMax Premium"
- amount: "$18.99"
- pattern: "Recurring · monthly · price up $3.00 this month"
- explanation: positively framed, e.g. "This monthly subscription went up $3.00 from your usual $15.99 — we wanted you to know before you spot it on a statement."

**Row 2 — annual renewal recognized**
- date: "Sep 12", rail: "CARD", icon: "music"
- raw: "AUDIOPHILE MUSIC SUB RENEW"
- clean: "Audiophile Music"
- amount: "$99.00"
- pattern: "Recurring · annual renewal"
- explanation: e.g. "This is your yearly music subscription renewal — recognized and labeled automatically."

Both entries get `needsConfirmation: false`.

### 2. Component — `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`
- Import `Tv` and `Music` from lucide-react.
- Add to `PURCHASE_ICONS`: `streaming: Tv`, `music: Music`.

### No other changes
- Row layout stays one line (date · merchant · amount · rail chip); expanded detail (original statement, pattern, explanation, "Yes, that's mine") works unchanged for the new rows.
- The vending row keeps its yellow highlight, its position above the new rows, and the confirm flow.
- No changes to other slides, tokens, navigation, or beats.

## Verification
- `bunx tsgo --noEmit` clean; build OK in build-errors.log.
- Playwright at 1540×855 on the Immediate Value slide: both new rows visible at the bottom, expanding shows the price-change pattern and explanation, no page errors.
