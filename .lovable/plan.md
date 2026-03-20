

## Show TEPilot-style Enrichment Table When Clicking "Ventus AI Engine"

### What Changes

When clicking the "Ventus AI Engine" node in the /demo network diagram, instead of the current dark-themed JSON profile view, show a light-themed enrichment results table — the same columnar, color-coded format used in the TEPilot `/tepilot` results tab.

### Current State

- Clicking "engine" node renders `DemoPillarCodeView` which shows raw JSON request/response payloads
- The TEPilot `ResultsTable` component has the exact table layout wanted: Merchant, Amount, Date, → arrow, Pillar (color-coded badges), Subcategory, Tier, Frequency, Confidence — all with distinct badge colors

### Plan

**1. Create `src/components/demo/DemoEnrichmentTableView.tsx`** — New component

A side-by-side (2-column grid) light-themed view showing enriched transactions for both customers in the TEPilot table style:

- Reuse the same color logic from `ResultsTable`: `PILLAR_COLORS` for pillar badges, tier colors (amber/blue/teal), frequency colors (indigo/violet/cyan/orange/slate), confidence colors (green/yellow/red)
- Each column: customer name header, then a scrollable table with columns: Merchant (normalized + original), Amount, Date, Pillar badge, Subcategory, Tier badge, Frequency badge, Confidence badge
- Light white background with `border-slate-200`, matching TEPilot styling
- No Card wrapper — just the table directly in each column since the overlay already provides the frame
- Include transaction count summary at top of each panel
- Omit the Actions/Eye column and Source column (not relevant in demo context)
- Omit the TransactionDetailModal (keep it simple for demo)

**2. Update `src/components/demo/DemoDetailOverlay.tsx`**

- Change the `engine` case in `renderContent()` to render `DemoEnrichmentTableView` instead of `DemoPillarCodeView`
- Pass `customerA`, `customerB`, `enrichedA`, `enrichedB`
- Update the engine title in `NODE_TITLES` to something like `"Ventus AI Engine — Enrichment Output"`
- Keep profiling/predictive/phase still using `DemoPillarCodeView`

### Technical Details

- Import `PILLAR_COLORS` from `@/lib/sampleData` for pillar badge coloring
- Reuse the same `getConfidenceColor`, `getTierColor`, `getFrequencyColor` helper functions from ResultsTable (copy them into the new component to keep it self-contained)
- Use `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table` and `Badge` from `@/components/ui/badge`
- The overlay background is already white (`rgba(255,255,255,0.97)`), so the light theme will match naturally

### Files
- **New**: `src/components/demo/DemoEnrichmentTableView.tsx`
- **Edit**: `src/components/demo/DemoDetailOverlay.tsx` (swap engine rendering + update title)

