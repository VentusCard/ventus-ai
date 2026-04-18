

## Goal
Redesign deal tiles in `NextOfferRationale.tsx` to use available space — bigger text/icons, surface hidden fields (`rewardValue`, `message`), add per-deal **delivery timing insight**, and **keep all existing reasoning text** (signal reason, suppression notes, boost chips, rollup explanation).

## Keep (no removals)
- Rollup header pill + count
- Suppressed/boost chips with reasons
- Per-deal `signalReason` ("matches dining cadence", etc.)
- Any explanatory copy already shown above/below tiles

## Changes — `src/components/exec-demo/NextOfferRationale.tsx`

### 1. Tile grid
- `grid-cols-5` → `grid-cols-2 gap-2.5`
- Tile padding `p-2` → `p-3`, `flex flex-col` with `min-h-[180px]` so CTA pins to bottom

### 2. Per-tile layout (top → bottom, all rows kept)
```text
┌────────────────────────────────────┐
│ Carbone                  ↑ trend   │  text-[13px] font-bold + w-3.5 icon
│ [ 5% back ]                        │  NEW reward pill — text-[11px]
│                                    │
│ "Your weekly Italian ritual,       │  NEW message — text-[11px] italic
│  rewarded with every visit."       │  slate-600, line-clamp-2
│                                    │
│ ↑ matches dining cadence           │  KEPT signalReason — text-[10.5px]
│                                    │  emerald-700, w-3 icon (bumped)
│                                    │
│ ⚡ Deliver morning of visit day     │  NEW delivery insight —
│    next ~Apr 22                    │  text-[10px] amber-700, bg-amber-50/60
│                                    │
│ [ Activate Offer            → ]    │  CTA full-width text-[11px] py-1.5
└────────────────────────────────────┘
```

### 3. Delivery insight derivation
Lightweight inline helper using the deal's matched pillar cadence (already available via the same data feeding `PurchaseCycleTimeline`, or recomputed from deal's transaction set):
- Annual/seasonal → "Deliver 3–4 weeks before \<peak month\> · next ~MMM D"
- Monthly (~28–35d) → "Deliver 2–3 days before next visit · next ~MMM D"
- Weekly (~5–10d) → "Deliver morning of typical visit day · next ~MMM D"
- Sporadic → "Real-time trigger on next category transaction"
- No data → hide block only

### 4. Header bumps (all existing reasoning text preserved, just larger)
- Rollup pill: `text-[10px]` → `text-[11px]`, padding `px-2.5 py-1`
- Suppressed/boost chips: `text-[9px]` → `text-[10px]`, icons `w-2.5` → `w-3`
- Card padding: `px-3 pt-2.5 pb-3` → `px-4 pt-3 pb-4`

### 5. Graceful degrade
- Missing `message` → hide that line only
- Missing `rewardValue` → hide pill only
- Missing delivery insight → hide that block only
- All other rows always render

## Out of scope
- No edge-function changes
- No filtering / rollup logic changes
- Shopping Pattern card unchanged
- Loading skeleton unchanged

## Expected result
Tiles fill panel width with 2 per row at readable sizes. Every existing reasoning line stays. New rows add reward value, personalized message, and a per-deal "when to deliver" recommendation.

