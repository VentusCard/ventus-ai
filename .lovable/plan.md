

## Redesign Signal Pills: Stacked, Color-Coded with Legend, Amounts & Counts

### Current State
Pills are grouped in labeled rows by pillar (e.g. "Travel & Transport → Airlines 3x, Hotels 2x"). Each pill only shows a label and count. No color coding, no spend amounts, no legend.

### Design

**1. Data changes — enrich SignalEntry with amount**
- `SignalEntry` gains an `amount` field: `{ pillar: string; label: string; amount: number }`
- `buildSignalMap()` in `execDemoData.ts` parses the amount column and includes it
- `mergeAiResults` preserves amounts from local signals

**2. Pill derivation — aggregate both count and total spend**
- `deriveGroups()` replaced with a flat `deriveChips()` that returns `{ pillar, label, count, totalSpend }[]` sorted by totalSpend descending
- No row grouping — all pills flow in a single flex-wrap container

**3. Color-coded pills by pillar**
- Define a `PILLAR_COLORS` map (e.g. Travel → blue, Food → amber, Wellness → emerald, Shopping → violet, etc.)
- Each pill's background and border tint uses its pillar color
- Pills show: **label · count × · $amount** (e.g. "Airlines · 4× · $2,340")

**4. Compact legend**
- Small horizontal row of color dots + pillar names rendered above the pill cloud
- Only shows pillars that have at least one signal (grows dynamically during animation)

**5. Layout**
- Remove `PillarRow` component entirely
- Single `<div className="flex flex-wrap gap-1.5">` for all pills
- Legend sits above the pill cloud as a small row of `dot + label` pairs

### Files
1. **`src/components/exec-demo/execDemoData.ts`** — add `amount` to `SignalEntry`, update `buildSignalMap()` to parse amounts
2. **`src/components/exec-demo/ExecDemoIntelPanel.tsx`** — replace row-based layout with flat color-coded pill cloud + legend, update chip to show count and spend

