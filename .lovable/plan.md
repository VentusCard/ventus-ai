

## Fix: 3 Malformed CSV Rows in Sample Data

### Problem
Three rows in `src/lib/sampleData.ts` have their columns duplicated from `amount` onward — a copy-paste artifact. This causes the parser to read corrupted `source` values like `Cashback Card287.50` and produces extra dangling columns.

### Affected rows

| Line | Merchant | Issue |
|------|----------|-------|
| 225 | PAYPAL*TICKETMASTR Sabrina Carpenter | `Cashback Card287.50,2024-11-23,,Cashback Card` |
| 232 | LULULEMON | `Premium Card89.00,2025-01-15,94102,Premium Card` |
| 291 | WARBY PARKER | `HSA195.00,2025-10-08,94102,HSA` |

### Fix
**File: `src/lib/sampleData.ts`** — 3 line replacements

Each row trimmed to the correct 8 columns:
```
txn_005,PAYPAL*TICKETMASTR Sabrina Carpenter,Concert tickets via Ticketmaster,7922,287.50,2024-11-23,,Cashback Card
txn_012,LULULEMON,Athletic wear purchase,5655,89.00,2025-01-15,94102,Premium Card
txn_052,WARBY PARKER,Prescription glasses,8043,195.00,2025-10-08,94102,HSA
```

One file, three lines.

