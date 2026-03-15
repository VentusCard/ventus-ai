

# Align Demo `sampleTransactions` with Real CSV Data

## Problem
The `sampleTransactions` in `demoData.ts` are manually written summaries (4 per customer) that don't match the actual CSV data fields. The real CSVs in `sampleData.ts` already include `zip_code` and `source` — these fields just aren't carried over to the demo display data.

## Plan

### 1. Update type in `src/lib/demoData.ts` (line 24)
Add `zip_code` and `source` to the `sampleTransactions` type definition.

### 2. Update all 6 customers' `sampleTransactions` in `src/lib/demoData.ts`
Pull the values directly from the corresponding CSV data so they match. For each customer's 4 sample transactions, add the correct `zip_code` and `source` from the CSV. Example for c1:
```ts
{ merchant: "Equinox Fitness", amount: "$200", date: "Aug 15", category: "Wellness", zip_code: "94102", source: "Premium Card" },
```

### 3. Update display in `src/components/demo/DemoNetworkDiagram.tsx` (~line 381)
Show `source` as a small colored badge on each transaction row, using the existing color scheme from memory (Checking=Slate, Cashback=Green, Travel=Blue, Premium=Purple, HSA=Amber).

### Files
- **Edit**: `src/lib/demoData.ts` — type + data for all 6 customers
- **Edit**: `src/components/demo/DemoNetworkDiagram.tsx` — display source badge

