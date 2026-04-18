

## Goal
Enrich the Shopping Pattern card on the Next-Offer tab with more concrete purchase insight: subcategory mix (e.g. "Italian, Sushi"), spend share, lifetime totals, and a compact 12-month timeline sparkline — while keeping the plain-English summary line at the top.

## Current state
`PurchaseCycleTimeline.tsx > buildCadence()` already derives:
- top merchant, cadence (weekly/monthly/annual), seasonality, velocity, summary line

Missing:
- subcategory breakdown (the rollup contains `categoryIndices` mapping into transactions which carry `category`/`subcategory`)
- compact monthly trend visual
- spend totals (we compute `totalSpend` but never display it)

## Changes — single file: `src/components/exec-demo/PurchaseCycleTimeline.tsx`

### 1. Extend `buildCadence` to also return:
- `topSubcategories: { name: string; count: number; spend: number; pct: number }[]` — top 3 by count, derived from `t.subcategory` (fallback `t.category`)
- `monthlyTrend: number[]` — length 12, normalized 0–1, last 12 months ending at most-recent tx
- `lifetimeSpend: number` (already computed) and `avgTicket: number = totalSpend / totalCount`
- `firstSeen: Date | null`, `lastSeen: Date | null` for "Active since Mar 2024"

### 2. Refine summary line to include subcategory when meaningful
If top subcategory ≥ 40% of count and isn't generic, prepend it:
- "Monthly Italian dining at Carbone" instead of "Monthly Dining at Carbone"
- "Annual Hawaiian getaway every July, mostly flights & hotels"

### 3. Update `CadenceCard` layout (still compact, single card)

```text
┌──────────────────────────────────────────────┐
│ ✦ DINING · SHOPPING PATTERN                  │
│ "Weekly Italian dining at Carbone"           │
│                                              │
│ ↻ Cadence    every ~7 days · 48 visits/yr    │
│ 📅 Active     Mar 2024 → today (14 mo)        │
│ 📍 Top spot   Carbone (12 of 48)              │
│ 🍝 Top types  Italian 52% · Sushi 18% · Bar 12%│
│ 💵 Lifetime  $4,820 · avg $42/visit           │
│ 📈 Trend     +18% vs prior quarter            │
│                                              │
│ [▁▂▃▅▇▆▅▇█▇▆▅] last 12 months                 │
└──────────────────────────────────────────────┘
```

Implementation notes:
- Subcategory chips: inline text row with `·` separators, color-muted percentages
- Sparkline: pure inline SVG, ~140×24px, uses pillar accent color at 60% opacity, no library
- "Active since" only shown if span ≥ 60 days
- Hide rows that don't apply (e.g. no subcategory data → skip that line)
- All copy stays "vaguely specific" — no exact transaction counts in summary line, but data rows can show counts (this is the banker view, not customer)

### 4. Subcategory naming
- Use `t.subcategory` if present, else `t.category`, else skip
- Title-case, dedupe on lowercase
- Ignore generic placeholders like "Other", "Miscellaneous", "Unclassified"

## Out of scope
- No edge function changes
- No changes to `NextOfferRationale` (deal filtering already works)
- No changes to pill behavior
- No new dependencies (sparkline is inline SVG)

## Expected result for Sarah
- Pet Care pill → "Monthly vet visits at Banfield · Veterinary 88% · Lifetime $1,240 · sparkline shows steady monthly bumps"
- Frequent Traveler pill → "Annual Hawaiian getaway every July · Flights 54% · Hotels 31% · Lifetime $8,400 · sparkline spikes in Jul"
- Dining pill → "Weekly Italian dining at Carbone · Italian 52% · Sushi 18% · Lifetime $4,820 · trend +18%"

