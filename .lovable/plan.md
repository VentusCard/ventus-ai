## Add Income chip after the KYC/demographics line

### Placement
`src/components/demo/DemoCustomerPanel.tsx` — insert a new chip row directly **after** the Industry/Income KYC line (`lines 340-352`) and **before** the existing summary stats row (`lines 354-365`).

### Detection — source-agnostic
Income = any transaction whose `merchant_name` or `description` matches an extensible keyword set:
- `PAYROLL`, `DIRECT DEP`, `DIR DEP`, `SALARY`, `IRS TREAS`, `SSA TREAS`, `PENSION`, `DIVIDEND`
- Case-insensitive, substring match
- Source field is **not** used for the rule — keeps it future-proof for non-ACH income (Zelle deposits, brokerage transfers, gig payouts, etc.)
- Centralize in a small local helper `isIncomeTransaction(t)` so we can swap in a smarter classifier later.

### Chip visuals
- Single emerald pill matching the existing source-pill style, e.g.
  `Income · $114,000 · 12 deposits`
- Uses the same `text-[11px]` row as KYC, emerald accent (`bg-emerald-50 text-emerald-700`) since income is a positive money-in signal.
- Only renders when at least one income txn is detected; otherwise the row is omitted.

### Total recalculation
- `totalSpend` (line 281) becomes spend-only: sum of non-income transactions.
- Existing `$X total` chip now accurately reflects outflows; no label change needed (still reads "total").
- Income is **not** double-counted.

### Out of scope
- No changes to `Transaction` type, parsers, sample data, enrichment, or downstream views.
- Table rows render unchanged — income rows still show their existing source pill.
- No new color tokens.