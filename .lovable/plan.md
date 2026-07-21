## Goal
Remove the sparkline chart and its "last 12 mo" label from the **Next-Offer** tab in `/bankdemo`.

## Current state
- The Next-Offer tab maps to `activeTab === "analytics"` in `ExecDemoIntelPanel.tsx`.
- That tab renders `PurchaseCycleTimeline.tsx`.
- Inside `PurchaseCycleTimeline.tsx`, the `CadenceCard` component renders a `Sparkline` SVG plus a "last 12 mo" text label when `data.monthlyTrend` has values.
- `PurchaseCycleTimeline` is only used for the Next-Offer tab, so removing the sparkline there removes it from the tab entirely.

## Plan
1. **Edit `src/components/exec-demo/PurchaseCycleTimeline.tsx`**
   - Delete the `Sparkline` function definition (lines ~332–353).
   - In `CadenceCard`, remove the conditional block that renders `<Sparkline values={data.monthlyTrend} color={accent} />` and the adjacent "last 12 mo" span.
   - Remove any now-unused imports/variables if applicable (e.g., `W`, `H`, `pad`, `step`, `points`, `path`, `areaPath`, `last`, `lastX`, `lastY`).

2. **Verify**
   - Re-read the edited section to confirm the sparkline and text are gone and the card layout still renders cleanly.
   - Run a TypeScript/build check to ensure no references to the removed `Sparkline` remain.

## Outcome
The Next-Offer tab will no longer display the monthly-trend sparkline or the "last 12 mo" caption; the rest of the cadence card content remains unchanged.