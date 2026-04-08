

## Add All Columns Back to Transaction Table

### Change
Update `ExecDemoSelectionDialog.tsx` to show all 8 CSV columns instead of just 3.

**`RawRow` interface** — add back `transaction_id`, `amount`, `date`, `zip_code`, `source`.

**`parseCsvRows`** — extract all 8 fields.

**Table columns** (in order):
1. Transaction ID (mono, truncated)
2. Date
3. Merchant Name (truncated)
4. MCC (mono)
5. MCC Description
6. Amount (right-aligned)
7. Zip Code
8. Source

Compact styling (`text-[11px]`) with horizontal scroll if needed.

### File
- `src/components/exec-demo/ExecDemoSelectionDialog.tsx`

