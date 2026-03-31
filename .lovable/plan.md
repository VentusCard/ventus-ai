

## Plan: Compact Expiring Soon Cards — Single Line with Deal Label

### Changes (single file: `DemoRewardsView.tsx`, lines ~232–248)

1. **Merge merchant name + deal info onto one line**: Replace the stacked `<div>` layout with a single horizontal flex row showing: icon, merchant name, countdown, and deal value label — all inline.

2. **Style the deal value as a label/badge**: Present `rewardValue` (e.g. "15% Off") as a small pill/badge similar to the personalized deal cards below — rounded background, bold text, colored styling.

**Revised card markup** (conceptually):
```tsx
<button className="rounded-md border px-1.5 py-0.5 flex items-center gap-1.5 ...">
  <span className="text-xs">{icon}</span>
  <span className="text-[9px] font-semibold text-slate-800 whitespace-nowrap">{merchantName}</span>
  <span className="text-[7px] font-bold text-red/amber">{hoursLeft}h left</span>
  <span className="ml-auto px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-green-100 text-green-700">
    {rewardValue}
  </span>
</button>
```

Single file edit, ~15 lines changed.

