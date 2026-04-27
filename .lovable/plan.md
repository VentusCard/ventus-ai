## Goal

Stack the rolled-up pills vertically — one pill per row — in the expanded section (Spending Habits, Life Event Detection, Risk Factors).

## Change

### `src/components/exec-demo/ExecDemoIntelPanel.tsx`

In the expanded rollup view (the three sections rendered when `pillsExpanded` is true and synthesis is done), change each pill container from:

```tsx
<div className="flex flex-wrap gap-2">{...pills}</div>
```

to:

```tsx
<div className="flex flex-col items-start gap-1.5">{...pills}</div>
```

Applied to all three groups:
- **Spending Habits** (rollupPills)
- **Life Event Detection** (lifeEventPills)
- **Risk Factors** (riskPills)

`items-start` keeps each pill at its natural width instead of stretching to the full column. The collapsed-state (`flex flex-wrap gap-2` cluster shown when `pillsExpanded` is false and a tab is active) stays unchanged so the compact horizontal grouping still works.

## Files touched
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`
