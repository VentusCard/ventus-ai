

## Consolidate customer info to one line in ExecDemoSelectionDialog

### What
Collapse the 3-line customer info block (name + txn count + total + date range, then demographics line 1, then demographics line 2) into a single, more visible line. Remove date ranges. Increase text size and darken colors.

### Changes

**`src/components/exec-demo/ExecDemoSelectionDialog.tsx`** — lines 212–228

Replace the current 3-line layout with a single line:

```tsx
<div className="px-6 pt-3 pb-2 shrink-0">
  <div className="flex items-center gap-2 flex-wrap text-[13px] text-slate-700 font-medium">
    <span className="font-bold text-slate-900">{customer.profile.name}</span>
    <span className="text-slate-300">·</span>
    <span>{rawRows.length} transactions</span>
    <span className="text-slate-300">·</span>
    <span>{customer.txnTotal}</span>
    {customer.profile.demographics && (
      <>
        <span className="text-slate-300">·</span>
        <span>{customer.profile.demographics.age}</span>
        <span className="text-slate-300">·</span>
        <span>{customer.profile.demographics.occupation}</span>
        <span className="text-slate-300">·</span>
        <span>{customer.profile.demographics.familyStatus}</span>
        <span className="text-slate-300">·</span>
        <span>{customer.profile.segment}</span>
        <span className="text-slate-300">·</span>
        <span>{customer.profile.aum}</span>
        <span className="text-slate-300">·</span>
        <span>{customer.profile.demographics.incomeLevel}</span>
        <span className="text-slate-300">·</span>
        <span>{customer.profile.demographics.industry}</span>
      </>
    )}
  </div>
</div>
```

Key differences:
- Single line with dot separators instead of 3 stacked lines
- Text bumped from 10–11px to 13px
- Colors darkened from slate-400/500 to slate-700/900
- Date range (`customer.dateRange`) removed entirely

