

## Plan: Data-Driven Next-Purchase Intelligence

### Problem
The current seasonal heatmap uses hardcoded archetypal curves (`SEASONAL_CURVES`) — the same generic pattern for "Grocery" or "Airlines" regardless of the actual user's spending. The insight callout is also derived from these static curves rather than the user's real data.

### Solution
Derive all seasonal patterns and insights **from the user's actual transactions**:

1. **Parse real transaction dates** — the `SignalEntry` currently has `pillar`, `label`, `amount`, `frequency`. We also have access to the raw transactions (with dates like `04/15`, `01/22`). We'll pass the raw transactions alongside chips so the timeline can bucket spending by month.

2. **Build per-category monthly spend from actual data** — group transactions by category and month, producing a real 12-month spend distribution instead of using `SEASONAL_CURVES`.

3. **Derive insights from the real distribution**:
   - Peak month = month with highest actual spend per category
   - YoY trend replaced with **spend velocity** (recent months vs earlier months)
   - "Next Seasonal Peak" insight uses the user's actual peak months and dollar amounts
   - Show spend concentration (e.g., "78% of travel spend in Jun-Aug")

### Changes

**`src/components/exec-demo/PurchaseCycleTimeline.tsx`**:
- Add a `transactions` prop (array of `{ date, merchant, amount }`)
- Add a `signalMap` prop to link transaction indices → categories
- Build monthly spend arrays from real transaction dates per category
- Remove all `SEASONAL_CURVES` and `yoyTrend` hardcoded logic
- Generate heatmap bars from actual monthly spend data
- Derive peak detection, trend direction, and insight text from real patterns
- Handle sparse data gracefully (months with $0 show as empty)

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**:
- Pass `transactions` and `signalMap` (from persona) to `PurchaseCycleTimeline` alongside `chips`

### Visual Output (unchanged layout)
- Same heatmap rows, but bars now reflect actual spend per month
- Peak badges based on real peaks
- Trend arrows based on recent-vs-historical spend momentum
- Insight callout: e.g., "Dining spend clusters in Nov-Dec ($2.4k) — 40% above annual average"

