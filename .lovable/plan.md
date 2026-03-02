

## Add Subcategories + Budget Bars to Engagement Pillar Cards

**File: `src/components/PlatformTabs.tsx`** — rewrite `EngagementPreview` component.

### Changes

Replace the current pillar cards (which only show spend, transaction count, and sparklines) with a richer layout that includes **subcategories** and **budget progress bars** — mirroring TEPilot's `PillarExplorer` budget mode.

### New Data Structure

Each pillar entry gains a `subcategories` array and a `budget` value:

```text
Travel ($1,240 / $1,500 budget)
  ├── Flights — $680
  ├── Hotels — $340
  └── Car Rental — $220

Dining ($480 / $500 budget)
  ├── Restaurants — $310
  ├── Coffee Shops — $95
  └── Delivery — $75
```

Four pillars total (Travel, Dining, Wellness, Shopping) to keep the preview compact.

### Visual Layout

- **Header**: "Monthly Spending by Pillar" with a "Budget Mode" badge
- **2x2 grid of pillar cards**, each containing:
  - Color accent bar at top (matching pillar color)
  - Pillar name + spend/budget text (e.g., "$480 / $500")
  - Budget progress bar (green = under, amber = near limit, red = over)
  - Status label ("Under Budget", "Near Limit", "Over Budget")
  - **2-3 subcategory rows** below, each showing subcategory name, amount, and a mini proportion bar
- **Bottom insight line**: "Wellness spending is 28% over budget this month — 3 subcategories contributing"

### Budget Status Logic (inline, no imports)

- Under 80% of budget: green, "Under Budget"
- 80-100%: amber, "Near Limit"  
- Over 100%: red, "Over Budget"

### Sample Data

| Pillar | Spend | Budget | Status | Subcategories |
|--------|-------|--------|--------|---------------|
| Travel | $1,240 | $1,500 | Under (green) | Flights $680, Hotels $340, Car Rental $220 |
| Dining | $480 | $500 | Near Limit (amber) | Restaurants $310, Coffee $95, Delivery $75 |
| Wellness | $320 | $250 | Over (red) | Gym $140, Supplements $105, Spa $75 |
| Shopping | $180 | $400 | Under (green) | Clothing $95, Electronics $50, Home $35 |

### Technical Notes

- Grid changes from 3-column to 2-column (`grid-cols-2`) to fit subcategory rows
- Subcategory rows use the same pillar color at reduced opacity for their mini bars
- No new imports needed — all inline JSX and Tailwind
- Sparklines are removed to make room for subcategory detail

