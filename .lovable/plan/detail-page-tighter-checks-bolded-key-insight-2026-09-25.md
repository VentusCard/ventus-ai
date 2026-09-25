# Detail page: tighter Checks, bolded key insight

## What changes

Two refinements to the transaction detail screen inside the deck phone (src/components/deckmo/DeckmoRecentTransactionsTab.tsx), plus a small data addition in src/lib/deckmoScript.ts:

1. **Checks section tighter**
   - Remove the redundant third check row ("Recurring · ..." / tx.pattern) for normal transactions — that fact already appears in OUR BANK INSIGHTS, so Checks keeps only its two verification rows.
   - Tighten the Checks card: smaller internal padding and row spacing than the Details card so the section reads compact.
2. **Bold the most insightful sentence in OUR BANK INSIGHTS**
   - Add an optional `insight` field to each activity row in `DECKMO.immediate` (src/lib/deckmoScript.ts) holding the exact substring of `explanation` to bold, keeping the explanation's reading order intact:
     - Courtside: "matches your usual every-other-week tennis club visit"
     - City Utilities: "your usual monthly utility payment"
     - Mia Chen: "payment to Mia Chen for a shared expense"
     - ATM: "an ATM near your home address"
     - Landscaping: "matches your regular landscaping service payment"
     - Escrow: "your home closing"
     - Spotify: "went up $2.00 from your usual $11.99"
     - JFK: "This purchase resembles vending machine purchases at JFK Airport."
     - LegalZoom: "a small-business expense, not a personal one"
   - In the detail view, render `explanation` with the `insight` substring bolded (font-bold, darker slate). The JFK example reads: "The merchant descriptor lists Troy, MI, but **This purchase resembles vending machine purchases at JFK Airport.** Please confirm so we label it correctly."
   - Rows without an `insight` value render unchanged.

## Out of scope

- No changes to list rows, correction/support flow, buttons, other beats, or /demo.

## Validation

- Playwright at 1540×855 and 1920×1080: open a regular transaction detail (checks compact, two rows) and the JFK detail (insight sentence bolded); no overflow; clean build.
