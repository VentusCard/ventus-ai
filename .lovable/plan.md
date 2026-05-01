## Goal
Renumber all `transaction_id` values in `SAMPLE_CSV` (first /demo customer) sequentially `txn_001` → `txn_068`, in the order they currently appear, so IDs match the row order.

## Implementation
- Edit lines 221–290 of `src/lib/sampleData.ts`.
- Replace each row's first column (txn_id) with `txn_001`, `txn_002`, ... `txn_068` based on its current position.
- Also drop the two blank lines (currently 254 and 271) so numbering is contiguous.
- All other columns (merchant, description, mcc, amount, date, zip, source) remain untouched.

## Out of scope
- No reordering of rows.
- No changes to other customers' CSVs or any other file.