

## Plan: Add "Next-Purchase Probability" Section Below the Seasonal Graph

### What It Does
Adds a new data-driven section below the existing "Seasonal Spend Intelligence" heatmap that calculates and displays the probability of the customer making a purchase in each category over the next 1, 2, and 3 months. This turns the backward-looking heatmap into a forward-looking predictive tool.

### Probability Calculation Logic
For each category row (already computed in `rows`), derive probability from three signals:

1. **Recency score** (40% weight): How recently was the last purchase? Categories with activity in the current or prior month score highest.
2. **Frequency score** (35% weight): How many months out of 12 had at least one transaction? A category with 10/12 months active has near-certain probability.
3. **Seasonality score** (25% weight): Does the upcoming month historically have spend? Uses the monthly spend array to check if the next 1/2/3 months had prior activity.

Combined into a 0–99% probability per category per future month window.

### Visual Design
Below the existing "Spending Pattern Insight" callout card, add:

```text
┌─────────────────────────────────────────────────┐
│ 🎯 NEXT-PURCHASE PROBABILITY                   │
├─────────────────────────────────────────────────┤
│ Category     │ Next 30d │ Next 60d │ Next 90d  │
│──────────────│──────────│──────────│───────────│
│ Groceries    │ ●●●● 94% │ ●●●● 98% │ ●●●● 99% │
│ Travel       │ ●○○○ 22% │ ●●○○ 45% │ ●●●○ 71% │
│ Pet Care     │ ●●○○ 41% │ ●●●○ 63% │ ●●●○ 78% │
│ ...          │          │          │           │
└─────────────────────────────────────────────────┘
│ 💡 "Groceries purchase expected within 5 days   │
│    based on weekly cadence. Travel likely in    │
│    Sep based on seasonal pattern."              │
└─────────────────────────────────────────────────┘
```

- **Probability dots**: 4-dot visual indicator (filled/empty) like signal strength, plus numeric percentage
- **Color coding**: Each row uses its pillar color; probabilities > 70% get a green tint, 40-70% amber, < 40% muted
- **Sorted by 30-day probability** descending — most imminent purchases first
- **Confidence badge**: "High", "Medium", "Low" based on data density (transaction count)
- **Smart insight sentence** at the bottom: picks the highest-probability category and explains the reasoning (recency + frequency + seasonal pattern)

### Detailed Calculation Per Category

```
recencyScore:
  - last purchase this month → 1.0
  - last purchase 1 month ago → 0.85
  - 2 months ago → 0.6
  - 3+ months ago → max(0.1, 1 - monthsAgo * 0.15)

frequencyScore:
  - activeMonths / 12 (months with any spend)

seasonalityScore (for N-month window):
  - average of normalized monthly spend for the next N months
  - normalized = monthSpend / peakMonthSpend

probability = recency * 0.40 + frequency * 0.35 + seasonality * 0.25
clamped to 1-99%
```

### Changes

**`src/components/exec-demo/PurchaseCycleTimeline.tsx`** — single file:

1. Add a new `useMemo` block computing `probabilityRows` from the existing `rows` data:
   - For each `SeasonalRow`, calculate recency (find last month with spend relative to `CURRENT_MONTH`), frequency (count non-zero months), and seasonality scores for 30d/60d/90d windows
   - Sort by 30-day probability descending
   - Take top 6 categories

2. Render a new section after the "Spending Pattern Insight" callout:
   - Header: crosshair icon + "NEXT-PURCHASE PROBABILITY" (same styling as existing section headers)
   - Compact table with category label, 3 probability columns with dot indicators + percentage
   - Each row uses `getColor(row.pillar)` for consistent pillar coloring
   - Confidence badge (High/Medium/Low) based on `row.count` (>6 = High, 3-6 = Medium, <3 = Low)
   - Bottom insight card with auto-generated sentence about the highest-probability upcoming purchase

3. Stagger reveal animations to follow after the existing content (`0.6s` base delay + per-row stagger)

