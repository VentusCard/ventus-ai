

## Plan: Use Synthesized Personas in Next-Purchase Tab

### Problem
The Next-Purchase tab (`PurchaseCycleTimeline`) currently groups transactions by raw classification pillars (e.g., "Food & Dining", "Travel & Transport"). Instead, it should use the synthesized persona rollups (e.g., "Weekend Foodie", "Style-Conscious Shopper") which are already computed by `synthesize-persona`.

### Changes

**1. Pass `personaSynthesis` to `PurchaseCycleTimeline`** (`ExecDemoIntelPanel.tsx`)
- Add `personaSynthesis` prop to the `PurchaseCycleTimeline` call on line 370.

**2. Refactor `PurchaseCycleTimeline.tsx` to use rollups as primary grouping**
- Accept `personaSynthesis` as an optional prop.
- When rollups exist, use each rollup's `label` (e.g., "Weekend Foodie") as the row label and its `pillar` for coloring.
- Use `txIndices` or `categoryIndices` from each rollup to pull the matching transactions for that row's monthly spend heatmap.
- Fall back to the current pillar-based grouping when no synthesis is available (loading state).
- Update both the Seasonal Spend heatmap rows and the Next-Purchase Probability cards to use rollup labels instead of raw pillar labels.

### What stays the same
- All calculation logic (recency, frequency, seasonality, probability, velocity) remains identical — only the grouping key changes from `signal.pillar::signal.label` to `rollup.label`.
- The visual layout, colors, insight cards, and animations are unchanged.

