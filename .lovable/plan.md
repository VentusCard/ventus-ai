

## Fix: Reset all filter state when switching customers

### Problem
When selecting a new customer, `activePillFilter` and `activeRollup` are not cleared. These stale filters from the previous customer cause the left panel to immediately show a filtered/highlighted transaction view (with pill label and colored highlights) instead of a clean slate.

### Change — `src/pages/ExecDemoPage.tsx`

**Add two reset calls** in both `handleSelectCustomer` (line ~196) and `handleLoadCustomCsv` (line ~213):
```typescript
setActivePillFilter(null);
setActiveRollup(null);
```

This ensures `filteredIndices` (derived via `useMemo` from these two state values) returns `null`, so the left panel renders the plain transaction list without any highlights or grouping.

### Expected result
- Switching customers always shows a clean transaction feed with no pill filters active
- No stale rollup/pill highlights carry over from previous customer

