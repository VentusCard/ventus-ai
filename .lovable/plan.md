

## Plan: Split Dashboard Tab into Data View + Mobile App Preview

Redesign the TEPilot "Dashboard" tab (analytics tab, single view) into a side-by-side layout showcasing how enriched data translates into a next-gen consumer UX.

### Layout Structure

```text
┌─────────────────────────────────────────────────────────┐
│  Header Card (full width)                               │
├──────────────────────┬──────────────────────────────────┤
│  30% - DATA VIEW     │  70% - CONSUMER UX PREVIEW       │
│                      │                                   │
│  Code/JSON-style     │  ┌─────────────────────────┐     │
│  enriched profile    │  │  📱 Mobile Frame         │     │
│  showing raw         │  │                          │     │
│  enrichment output:  │  │  PillarExplorer +        │     │
│  - pillars & scores  │  │  OverviewMetrics         │     │
│  - subcategories     │  │  inside scrollable       │     │
│  - lifestyle signals │  │  phone mockup            │     │
│  - travel patterns   │  │                          │     │
│  - demographics      │  │                          │     │
│                      │  └─────────────────────────┘     │
└──────────────────────┴──────────────────────────────────┘
│  BeforeAfterTransformation (full width)                  │
│  CTA Card (full width)                                   │
└──────────────────────────────────────────────────────────┘
```

### Changes

**1. Create `src/components/tepilot/insights/DataProfileView.tsx`**
- New component rendering a dark-themed, code-like view of the user's enriched profile
- Display pillar breakdown as JSON-like syntax-highlighted data (monospace font, dark bg)
- Show: pillar names, spend amounts, percentages, subcategory counts, top merchants
- Include lifestyle signals, travel summary, and demographic data if available
- Use the existing `displayTransactions` data aggregated via `aggregateByPillar`

**2. Create `src/components/tepilot/insights/MobileAppFrame.tsx`**
- A presentational wrapper that renders a phone-shaped border (rounded corners, notch, status bar)
- Contains a scrollable inner area for the existing PillarExplorer + OverviewMetrics
- CSS-only phone frame (no images needed) — rounded-[2.5rem] border, top notch pill, bottom home indicator

**3. Update `src/pages/TePilot.tsx` (analytics tab, single view section ~lines 989-1011)**
- Replace the current stacked layout with a `flex` row: 30% left (DataProfileView) + 70% right (MobileAppFrame wrapping OverviewMetrics + PillarExplorer)
- Keep BeforeAfterTransformation and CTA card below at full width
- Add a small label above each panel: "Enriched Data Profile" and "Next-Gen Consumer Experience"

### Technical Details
- Left panel uses `w-[30%]` with `overflow-y-auto`, dark `bg-slate-900` with monospace text
- Right panel uses `w-[70%]` centered with the mobile frame component
- Mobile frame: ~375px wide, ~812px tall (iPhone proportions), centered in the 70% space
- PillarExplorer inside the frame will use compact styling (smaller grid cols, tighter gaps)
- On screens < 1024px, stack vertically instead of side-by-side

