

# Simplify TxCard to Two-Row Summary

## Current State
The `TxCard` in `DemoNetworkDiagram.tsx` (lines 380-401) shows 3 individual transaction rows with merchant names, source badges, and amounts.

## Plan

### 1. Add `summarizeCsv` helper to `src/lib/demoData.ts`
Parse each customer's CSV to compute: `txnCount`, `txnTotal` (formatted), `sourceCount`, `dateRange` (e.g. "Aug 1 – Nov 30"), and add these fields to the `DemoCustomer` type. Compute them for all 6 presets and in `buildCustomDemoCustomer`.

### 2. Simplify `TxCard` in `src/components/demo/DemoNetworkDiagram.tsx`
Replace the 3-transaction list (lines 380-401) with two rows:

```text
[initials] Sarah Mitchell
           75 txns · $10,260
           Aug 1 – Nov 30 · 4 sources
```

- **Row 1**: txn count + total spend in `text-[9px]` mono
- **Row 2**: date range + source count in `text-[9px]` mono, slightly dimmer

### Files
- `src/lib/demoData.ts` — add `summarizeCsv`, new fields on type + all customers
- `src/components/demo/DemoNetworkDiagram.tsx` — simplify `TxCard` body

