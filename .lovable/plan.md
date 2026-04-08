

## Show Full Raw Transactions from CSV in Selection Dialog

### Problem
The dialog currently shows only 4 hardcoded `sampleTransactions` per customer. Each customer actually has a full CSV (`customer.csv`) with 50+ raw transactions containing all columns: `transaction_id`, `merchant_name`, `description`, `mcc`, `amount`, `date`, `zip_code`, `source`.

### Solution
Parse the customer's `csv` field into rows and display ALL raw transactions in the table, showing every available column before enrichment.

### Changes to `ExecDemoSelectionDialog.tsx`

1. **Add CSV parser** — a simple function that splits `customer.csv` by newlines, extracts headers, and returns an array of row objects. Columns: `transaction_id`, `merchant_name`, `description`, `mcc`, `amount`, `date`, `zip_code`, `source`.

2. **Replace `sampleTransactions` with parsed CSV** — use `useMemo` to parse the selected customer's CSV on selection change.

3. **Update table columns** to show all raw fields:
   - Transaction ID
   - Merchant Name (raw string like `STARBUCKS COFFEE #1234`)
   - Description
   - MCC
   - Amount (numeric)
   - Date
   - Zip Code
   - Source

4. **Update header stats** — show the actual parsed row count instead of `customer.txnCount`.

5. **Table styling** — compact rows (`text-[11px]`), full-width scrollable area filling all available vertical space (the `flex-1 min-h-0` pattern already in place).

### Files
- `src/components/exec-demo/ExecDemoSelectionDialog.tsx` — add CSV parser, replace table data source and columns.

