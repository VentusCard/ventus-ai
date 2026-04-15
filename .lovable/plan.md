

## Simplify customer profile card in executive demo

### What
Trim the two-line demographics block in the top-left customer card to show only: Zip Code, Income Level, and Marital Status. Remove Segment, AUM, Age, Occupation, and Industry.

### Change

**File**: `src/components/exec-demo/ExecDemoLeftPanel.tsx`, lines 236-243

Replace the two `<div>` lines with a single line:

```tsx
{!isCustomMode && currentCustomer && (
  <div className="text-[9px] text-slate-500 truncate mt-0.5">
    {currentCustomer.zip} · {currentCustomer.profile.demographics?.incomeLevel} · {currentCustomer.profile.demographics?.familyStatus}
  </div>
)}
```

This shows e.g. `94102 · $150K–$200K · Married, 1 dependent` in one compact line.

Single file, ~8 lines replaced with ~4.

