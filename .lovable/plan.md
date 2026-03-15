

## Plan: Add source pills and consolidate summary stats

**Current state**: The summary shows txn count + total spend on line 1, date range on line 2. No source info.

**Target layout**:
- Line 1: `75 txns · $10,260 total · Aug 7 – Oct 13`
- Line 2: `Sources:` followed by colored pill badges for each unique source

**Changes** — single file: `src/components/demo/DemoCustomerPanel.tsx`

1. **Merge date range into the stats line** (lines 286-293): Combine the txn count, total spend, and date range into one flex row separated by dots.

2. **Add sources row**: Compute unique sources from `transactions` via `new Set(transactions.map(t => t.source).filter(Boolean))`. Render as a second line with label "Sources:" followed by pill badges using the existing source color scheme (the same colors already used in the table's source column).

