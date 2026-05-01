## Goal

Re-sort the first 10 rows of `SAMPLE_CSV` so MCC and no-MCC rows alternate (no-MCC rows are no longer clustered together). Still includes one of each source (Cashback Card, Premium Card, Checks, ACH, Zelle, Wire) and one MCC 5999. No row contents change.

## New first 10 rows


| #   | txn_id   | Merchant                   | MCC      | Source        |
| --- | -------- | -------------------------- | -------- | ------------- |
| 1   | txn_msc1 | HAYES VALLEY GENERAL STORE | **5999** | Cashback Card |
| 2   | txn_004  | SF TENNIS CLUB             | —        | Checks        |
| 3   | txn_h17  | HAWAIIAN AIRLINES HNL      | 4511     | Premium Card  |
| 4   | txn_007  | PACIFIC HEIGHTS APT        | —        | ACH           |
| 5   | txn_h15  | SUNBUM REEF SAFE SPF       | 5912     | Cashback Card |
| 6   | txn_009  | MARIA G                    | —        | Zelle         |
| 7   | txn_h18  | KOA KEA HOTEL KAUAI        | 7011     | Premium Card  |
| 8   | txn_052  | DOWN PAYMENT TRANSFER      | —        | Wire          |
| 9   | txn_h20  | NA PALI CATAMARAN TOUR     | 7999     | Cashback Card |
| 10  | txn_h16  | OLUKAI SANDALS             | 5661     | Premium Card  |


No-MCC rows now sit at positions 2, 4, 6, 8 — interleaved with MCC rows.

## Implementation

- Reorder lines 221–233 of `src/lib/sampleData.ts` to the sequence above.
- Rows 11+ stay in current order.
- No edits to row contents.