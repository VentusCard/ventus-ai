

## Merge Pillar × Region and Pillar × Age heatmaps into Pillar Deep Dive

The existing `PillarRegionHeatmap` and `PillarAgeHeatmap` are redundant now that `PillarDeepDiveHeatmap` already shows **Age × Region** for a selected pillar — combining both dimensions in one view. We'll remove the two old components and keep only the Deep Dive.

### Changes

**`src/components/tepilot/insights/BankwideView.tsx`**
- Remove imports and rendering of `PillarRegionHeatmap` and `PillarAgeHeatmap`
- The `PillarDeepDiveHeatmap` stays in its current position (between Pillar Explorer and Timing Grid)

**No other files need changes** — the old components can remain in the codebase as dead code, or be deleted for cleanliness. The mock data functions they call (`getPillarRegionMatrix`, `getPillarAgeMatrix`) stay since they don't hurt anything.

### Result
The Bankwide view goes from three separate heatmap sections to one unified **Pillar Deep Dive** that covers both age and region dimensions simultaneously, with richer subcategory insights.

