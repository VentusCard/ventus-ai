

## Redesign: Next-Purchase Probability Section

### Problem
The current probability section mirrors the heatmap's tabular grid layout (columns, signal dots, percentages), making the two sections look like duplicates rather than offering a distinct visual insight.

### New Design: Ranked Horizontal Bar Cards

Replace the table with a stacked list of compact **mini-cards**, each showing a horizontal gradient probability bar. This visually contrasts with the grid-based heatmap above and feels more like a "prediction dashboard."

```text
┌──────────────────────────────────────────────┐
│ 🎯 NEXT-PURCHASE PROBABILITY                │
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ Groceries                   94% · 5 days │ │
│ │ ██████████████████████████████░░░░  High  │ │
│ │ Weekly cadence · peak season              │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ Pet Care                    41% · ~3 wks │ │
│ │ ██████████░░░░░░░░░░░░░░░░░░░░░░  Med   │ │
│ │ Monthly pattern · last seen 2mo ago      │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ Travel                      22% · ~6 wks │ │
│ │ █████░░░░░░░░░░░░░░░░░░░░░░░░░░░  Low   │ │
│ │ Seasonal — historically peaks in Sep     │ │
│ └──────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ 💡 Groceries expected within 5 days based   │
│    on weekly cadence.                        │
└──────────────────────────────────────────────┘
```

### Per-Card Elements
- **Top line**: Category name (pillar-colored) + bold probability % + estimated "days until next" (derived from frequency: `30 / activeMonths` approximation)
- **Gradient bar**: Fills left-to-right proportional to the 30-day probability, using the pillar's color with a subtle gradient. Background is a light neutral track.
- **Confidence tag**: "High" / "Med" / "Low" badge anchored at the right end of the bar
- **Sub-text**: A one-line reason string auto-generated from the data (e.g., "Weekly cadence · accelerating +15%" or "Seasonal — peaks in Sep · last seen 3mo ago")

### Color Treatment
- Bar fill: pillar dot color → faded pillar color gradient
- >70% probability: subtle green-tinted card background
- 40–70%: subtle amber tint
- <40%: neutral/transparent

### Reason String Logic
Compose from available data:
- **Cadence**: `activeMonths >= 10` → "Weekly cadence" | `>= 6` → "Bi-monthly" | `>= 3` → "Quarterly" | else → "Occasional"
- **Velocity**: if `|velocity| >= 15`, append "accelerating +X%" or "declining -X%"
- **Seasonality**: if next month has historical spend, append "peak season" or "historically peaks in {month}"
- **Recency**: if `lastMonthAgo >= 3`, append "last seen Xmo ago"

### Changes

**`src/components/exec-demo/PurchaseCycleTimeline.tsx`**:

1. Remove `SignalDots` component and the table-style column headers / row grid (lines 102-117, 471-534)
2. Add a `daysUntilEstimate` helper: `Math.round(30 / Math.max(activeMonths, 1))` capped at 90
3. Add a `buildReasonString(pr, rows)` helper using the cadence/velocity/seasonality logic above
4. Replace the probability section render with the new card-based layout:
   - Each card is a `div` with rounded corners, subtle pillar-tinted background, containing the name + percentage row, a full-width progress bar `div`, and a reason sub-text
   - Cards stagger-animate in with existing `exec-card-reveal` keyframes
5. Keep the `ConfidenceBadge` component (repositioned inside the bar area)
6. Keep the predictive insight card at the bottom (already has distinct styling)

