# Restore source variety in top 10 rows of selection dialog

After removing the suspicious `INTL PAYMENT PROC` row and adding the 2024 Kauai trip, the top of `SAMPLE_CSV` is now dominated by Cashback Card and Premium Card. The other four sources (Checks, ACH, Zelle, Wire) don't appear until much later, so the selection dialog's preview no longer showcases the full payment-source palette in its first viewport.

I'll re-promote the four "rare source" rows into the top 10 by reordering — no rows added, no data changed.

## Changes — `src/lib/sampleData.ts` (`SAMPLE_CSV` only)

Reorder so the first 10 rows cover all 6 sources:

| # | txn_id | Source |
|---|---|---|
| 1 | `txn_h15` SUNBUM | Cashback Card |
| 2 | `txn_h16` OLUKAI | Premium Card |
| 3 | `txn_h17` HAWAIIAN AIRLINES | Premium Card |
| 4 | `txn_004` SF TENNIS CLUB | **Checks** |
| 5 | `txn_007` PACIFIC HEIGHTS APT | **ACH** |
| 6 | `txn_009` MARIA G dogsitting | **Zelle** |
| 7 | `txn_052` DOWN PAYMENT TRANSFER | **Wire** |
| 8 | `txn_h18` KOA KEA HOTEL | Premium Card |
| 9 | `txn_h19` BUDGET RENT-A-CAR | Premium Card |
| 10 | `txn_h20` NA PALI CATAMARAN | Cashback Card |

Slots 4–7 are simply moved up from their current positions (lines 231–234); the remaining Hawaii and SF rows shift down by 4 to fill the gap. No row content or dates change.

## Out of scope

- No new transactions, no edits to merchant/amount/date/source fields.
- Sort order remains by row position (the persona engine sorts by date internally so analytics aren't affected).

## Result

The selection dialog's preview viewport once again shows one transaction from every payment source (Cashback Card, Premium Card, Checks, ACH, Zelle, Wire) within the first 10 rows.
