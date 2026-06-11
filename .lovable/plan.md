## Horizontal Card Layout for Expanded Panel

### Problem
The 3 product-agnostic dimension cards inside each expanded signal panel are currently stacked vertically (`flex flex-col`), wasting horizontal space and creating an overly tall panel.

### Change
In `ExpandedPanel` (bottom of `ExclusionFunnelSection.tsx`), change the card container from:

```
<div className="flex flex-col gap-2">
```

to a horizontal layout:

```
<div className="grid grid-cols-3 gap-2">
```

Each card (`rounded-md border border-slate-200 bg-white p-2.5`) will sit side-by-side in equal-width columns. No other props, data, or behavior changes.

### Files touched
- `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx` — one className change in `ExpandedPanel`.