

## Pillar Deep Dive — Age × Region Heatmap with Subcategory Insights

### Overview
Add a "Pillar Deep Dive" button to the Category Consolidation page. When clicked, the user selects a pillar and date range, then sees a smooth gradient heatmap with **Age Range** (rows) × **Region** (columns) showing spend intensity, growth, and — crucially — **subcategory callouts** (e.g. "Pickleball ↑ 34%" for Gen-Z in Southwest under Sports & Active Living).

### New file: `src/components/tepilot/insights/PillarDeepDiveHeatmap.tsx`

**Controls bar:**
- Pillar selector — dropdown of 12 pillars (default: Sports & Active Living)
- Date range picker — two date pickers (From / To), cosmetic only since data is mock
- A "Deep Dive" title with the selected pillar's color accent

**Heatmap grid:**
- Rows: 5 age groups (`18-24`, `25-34`, `35-44`, `45-54`, `55+`) with generational labels (Gen-Z, Millennials, Gen-X, Boomers I, Boomers II)
- Columns: 5 regions (`Northeast`, `Southeast`, `Midwest`, `Southwest`, `West`)
- Each cell is a smooth gradient-colored rectangle:
  - Color intensity from white → pillar color based on spend index
  - Shows: spend amount, spend index, YoY growth %
  - On hover tooltip: detailed breakdown
- **Subcategory callout** inside each cell — the top trending subcategory for that age×region intersection (e.g. "Pickleball ↑ 34%", "Golf ↑ 12%", "Yoga ↑ 18%")
- Cells with strong over-indexes (>130) get a subtle glow/border highlight

**Key insight banner** at top:
- Auto-generated sentence summarizing the most notable finding (e.g. "Gen-Z in the Southwest are driving a 34% surge in Pickleball spending — the strongest subcategory growth in Sports & Active Living")

### New data: `src/lib/mockBankwideData.ts`

Add a `getPillarDeepDive(pillar, filters)` function returning:
```ts
interface PillarDeepDiveCell {
  ageGroup: string;
  generationLabel: string;
  region: string;
  totalSpend: number;
  spendIndex: number;
  yoyGrowth: number;
  topSubcategory: string;
  subcategoryGrowth: number;
  userCount: number;
  color: string;
}
```

Each pillar gets a curated map of subcategory insights per age×region. For example, Sports & Active Living:
- 18-24 × Southwest → "Pickleball ↑ 34%"
- 25-34 × Northeast → "Golf ↑ 12%"
- 35-44 × Midwest → "Running ↑ 18%"
- 55+ × West → "Hiking ↑ 22%"

Similar curated subcategories for all 12 pillars (e.g. Food & Dining: "Ramen Shops ↑ 28%" for Gen-Z, "Farm-to-Table ↑ 15%" for Millennials).

### Update: `src/components/tepilot/insights/BankwideView.tsx`

Add a "Pillar Deep Dive" button (with `Microscope` icon) between the Pillar Explorer and the Region Heatmap. Clicking it toggles visibility of `<PillarDeepDiveHeatmap />`. This keeps the existing heatmaps intact while adding the new interactive view.

### Technical Details
- Heatmap uses CSS grid with smooth `background-color` interpolation via HSL
- Uses existing `CollapsibleCard` wrapper for consistency
- Date pickers use the Shadcn `Popover` + `Calendar` pattern with `pointer-events-auto`
- Pillar selector uses Shadcn `Select`
- All data is deterministic mock — no backend calls
- Subcategory data is a static lookup table keyed by `pillar → ageGroup → region`

