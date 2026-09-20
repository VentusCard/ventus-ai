# Replace the tropical-vacation external signal with high pet expenditure

## Goal
Ricky's external "Annual tropical vacation in December" signal duplicates the internal "Annual Hawaiian vacation" signal. Replace it with a **high pet expenditure** external signal so the two Behavioral external/internal signals tell different stories.

## Changes
- In `src/lib/deckmoScript.ts` (Ricky beat, Behavioral family), replace the external signal with:
  - **Label:** "High pet expenditure"
  - **Source indicator:** "Outside SKU-level purchase data" (matches the external sources already named on the Complete Picture slide)
  - **Detail:** "Recurring high-value pet spending observed outside the bank"
  - **Timing:** "Monthly · ongoing"
  - **Confidence:** "Likely"
- No other copy changes: the internal "Annual Hawaiian vacation" pill, the violet External badge styling, the external evidence panel layout, the car-loan external signal, and the 76-transaction ledger all stay exactly as they are.
- No transaction changes: external signals show only their External Intelligence evidence row, so Ricky's ledger fixture is untouched.

## Validation
- Behavioral family shows three pills: two internal (tennis, Hawaiian vacation) and one external ("High pet expenditure") with the violet External badge.
- Selecting the new pill shows the external evidence row (source, detail, timing, confidence) instead of transactions; internal pills still filter correctly and re-click resets to all 76.
- Typecheck clean, build clean, no overflow at 1024×768, 1540×855, and 1920×1080.
