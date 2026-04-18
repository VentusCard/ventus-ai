

## Goal
Reorganize the Shopping Pattern card body into two horizontal sections side-by-side. Header (pillar label + summary line) stays full-width on top.

## Layout

```text
┌─────────────────────────────────────────────────────────┐
│ ✦ DINING · SHOPPING PATTERN                             │
│ "Weekly Italian dining at Carbone"                      │
├──────────────────────────┬──────────────────────────────┤
│ LEFT: Spot & Info        │ RIGHT: Timing                │
│                          │                              │
│ 📍 Top spot  Carbone     │ ↻ Cadence    every ~7 days   │
│ 🏷 Top types Italian 52% │ 📅 Active    Mar 24 → today  │
│ 💵 Lifetime  $4,820      │ 📆 Season    Jul–Sep heavy   │
│              avg $42     │ 📈 Trend     +18% vs prior   │
│                          │                              │
│                          │ [▁▂▃▅▇▆▇█▇▆▅] last 12 mo     │
└──────────────────────────┴──────────────────────────────┘
```

## Changes — single file: `src/components/exec-demo/PurchaseCycleTimeline.tsx`

### `CadenceCard` component restructure

1. Keep header block (pillar tag + italic summary line) full-width on top
2. Replace single `space-y-1.5` column with a `grid grid-cols-2 gap-4` (with thin vertical divider via `divide-x divide-slate-100`)
3. **Left column — "Spot & Info"**:
   - Top spot (MapPin)
   - Top types / subcategories (Tag)
   - Lifetime spend + avg ticket (DollarSign)
4. **Right column — "Timing"**:
   - Cadence (Repeat)
   - Active span (Clock)
   - Seasonality (Calendar) — only when not "year-round"
   - Trend / velocity (TrendingUp/Down)
   - Sparkline at the bottom of the right column with "last 12 mo" caption

### Styling notes
- Each column gets `pl-3` / `pr-3` padding for breathing room around the divider
- Remove the existing top border on the sparkline (it now sits inside the right column)
- Keep `text-[11.5px]` density and icon sizing identical for visual continuity
- Hide a row entirely when its data is missing (existing behavior)
- If right column ends up with no data (rare), fall back to single-column layout to avoid an awkward empty half — guard with a simple `hasTimingData` check

## Out of scope
- No data/logic changes — purely a layout reorg
- No edge function or pill changes
- Life-event fallback card stays as-is

