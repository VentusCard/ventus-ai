## Change

Reorder the first 7 rows of `SAMPLE_CSV` (in `src/lib/sampleData.ts`) so every payment source present in the dataset appears in the top 7 rows of the selection-dialog table.

## Sources covered

The CSV contains 6 distinct sources: **Cashback Card, Premium Card, Checks, ACH, Zelle, Wire**. New top-7 ordering (one per source + one repeat to fill row 7):

1. `txn_001` WHOLE FOODS — **Cashback Card**
2. `txn_056` EPIC PASS VAIL — **Premium Card**
3. `txn_004` SF TENNIS CLUB — **Checks**
4. `txn_007` PACIFIC HEIGHTS APT — **ACH**
5. `txn_009` MARIA G — **Zelle**
6. `txn_052` DOWN PAYMENT TRANSFER — **Wire** (the only Wire row in the dataset)
7. `txn_002` CHEWY.COM — **Cashback Card** (repeat)

## Implementation

In `src/lib/sampleData.ts` (lines 220–282), move the 6 listed rows to the top of `SAMPLE_CSV` in the new order, and remove their original positions further down. All other rows keep their relative order. No row contents are edited — only their position in the CSV string.

## Notes

- HSA, Travel Card, and Checking are defined as colors in `SOURCE_COLORS` but are not present in this customer's CSV, so they cannot be surfaced in the top 7 without inventing transactions.
- This only touches the SF / Wellness Explorer customer (`SAMPLE_CSV`). Other customer CSVs (`SAMPLE_CSV_SPORTS_WELLNESS`, etc.) are untouched.
