

## Load Full Bank-Wide Analytics in /demo Overlay for 3 Cards

Currently, clicking Analytics / Travel / Wealth on `/demo` opens small per-customer comparison views. Instead, all three should open the full `AnalyticsContainer` (the bank-wide analytics page with sidebar navigation), each defaulting to a different tab.

### What Changes

**1. Rename "Travel Experiences" → "Reward Intelligence"** in `DemoNetworkDiagram.tsx`
- Node label: `"Travel Experiences"` → `"Reward Intelligence"`
- Keep the node id as `travel` (no routing changes needed)

**2. Rename in `DemoDetailOverlay.tsx`**
- Update `NODE_TITLES.travel` title to `"Reward Intelligence"`

**3. Update `DemoDetailOverlay.tsx` — render `AnalyticsContainer` for analytics/travel/wealth**
- Import `AnalyticsContainer` from `@/components/tepilot/insights/AnalyticsContainer`
- For `analytics` node → render `<AnalyticsContainer defaultTab="dashboard" />`
- For `travel` node → render `<AnalyticsContainer defaultTab="rewards-intelligence" />`
- For `wealth` node → render `<AnalyticsContainer defaultTab="life-events" />`
- Remove the side-by-side customer column headers for these three nodes (they show portfolio-level data, not per-customer)
- Remove old `DemoAnalyticsView` from `SIMPLE_VIEW_MAP`

**4. Adjust overlay layout for full-width**
- Hide customer A/B column headers when showing `AnalyticsContainer` (already conditional on `node !== "engine"`, extend to exclude analytics/travel/wealth)

### Files Modified
- `src/components/demo/DemoNetworkDiagram.tsx` — rename travel label
- `src/components/demo/DemoDetailOverlay.tsx` — render AnalyticsContainer with different default tabs, rename travel title, hide customer headers for these nodes

