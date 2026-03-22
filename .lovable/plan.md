

## Add Budget Bars and Trip View Toggle to Demo Engagement View

### Problem
The Personalized UX overlay in the conference demo (`DemoEngagementView.tsx`) is missing two features that exist on the homepage PlatformTabs version:
1. **Budget progress bars** — each pillar card should show a colored progress bar (green/amber/red) with a `$spend / $budget` label
2. **Trip View toggle** — the Travel card should show the toggle in the card header (not hidden inside the expanded section)

### Changes — `src/components/demo/DemoEngagementView.tsx`

#### 1. Generate deterministic budgets
Import or inline budget generation logic: for each pillar, compute `budget = spend * multiplier` (110–140% of spend, seeded by pillar name hash). This mirrors the approach used in the wealth copilot spending overview.

#### 2. Add progress bar to each pillar card
Between the pillar name row and the spend amount, insert:
- A thin progress bar (`h-1.5 rounded-full`) colored by ratio: green (<70%), amber (70–100%), red (>100%)
- Replace `$X` / `X% of total` with `$spend / $budget` format

#### 3. Move Trip View toggle to Travel card header
Show the Trip View toggle (small switch) next to the Travel pillar name, always visible — not only when expanded. Remove the duplicate toggle from inside the expanded section.

### Files Modified
- `src/components/demo/DemoEngagementView.tsx`

