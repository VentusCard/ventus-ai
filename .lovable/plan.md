## Goal

Give the transaction enrichment table a visible rounded-corner border in all states, including when it's rendered in full-width ("flush") mode where the border/rounding is currently stripped.

## Change

**File:** `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`

The wrapper currently strips the border and rounded corners when `flush` is true:

```tsx
const wrapperCls = flush
  ? "overflow-auto exec-light-scroll bg-white h-full"
  : "border border-slate-200 rounded-lg overflow-auto exec-light-scroll bg-white";
```

Update both branches to apply `border border-slate-200 rounded-xl`, so the table always has a soft rounded border (slightly larger radius than before for a more polished feel):

```tsx
const wrapperCls = flush
  ? "border border-slate-200 rounded-xl overflow-auto exec-light-scroll bg-white h-full"
  : "border border-slate-200 rounded-xl overflow-auto exec-light-scroll bg-white";
```

The wrapper already has `overflow-auto`, so the rounded corners will correctly clip the inner sticky header and rows.

No other files or structural changes.