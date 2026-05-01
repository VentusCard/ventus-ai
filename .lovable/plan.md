## Goal
Re-sort the first 10 rows of `SAMPLE_CSV` (first /demo customer) so they include **one transaction from each source** (Cashback Card, Premium Card, Checks, ACH, Zelle, Wire) **and one MCC 5999** transaction. No row contents change — only order.

## New first 10 rows (all already exist in SAMPLE_CSV)

| # | txn_id | Merchant | MCC | Source |
|---|---|---|---|---|
| 1 | txn_msc1 | HAYES VALLEY GENERAL STORE | **5999** | Cashback Card |
| 2 | txn_h17 | HAWAIIAN AIRLINES HNL | 4511 | Premium Card |
| 3 | txn_004 | SF TENNIS CLUB | — | Checks |
| 4 | txn_007 | PACIFIC HEIGHTS APT | — | ACH |
| 5 | txn_009 | MARIA G (dogsitting) | — | Zelle |
| 6 | txn_052 | DOWN PAYMENT TRANSFER | — | Wire |
| 7 | txn_h15 | SUNBUM REEF SAFE SPF | 5912 | Cashback Card |
| 8 | txn_h16 | OLUKAI SANDALS | 5661 | Premium Card |
| 9 | txn_h20 | NA PALI CATAMARAN TOUR | 7999 | Cashback Card |
| 10 | txn_h18 | KOA KEA HOTEL KAUAI | 7011 | Premium Card |

Row 1 covers both requirements (Cashback Card + MCC 5999). Rows 2–6 cover the remaining 5 sources. Rows 7–10 fill out the top of the feed with existing variety rows.

## Implementation
- Reorder lines 221–233 of `src/lib/sampleData.ts` to the sequence above.
- All other rows (currently lines 234+) stay in their existing order.
- No edits to merchant names, amounts, dates, MCCs, or sources.

## Out of scope
- No changes to other customers, deals, or persona summaries.
- No new transactions added.