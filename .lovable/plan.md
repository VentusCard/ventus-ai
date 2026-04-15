

## Collapse Intel Header to Rolled-Up Pills on Tab Select

### What the user wants
When clicking "Next-Offer" (or any action button), the top section of the intel panel (persona description, life events, risk factors) should collapse down to only show the rolled-up spending pattern pills in a compact horizontal strip. The tab content (PurchaseCycleTimeline, etc.) and phone mockup then expand upward to fill the freed space.

### Current behavior
- After synthesis + tab click: the top persona card keeps its full height (up to `45vh` with `maxHeight`), showing rollups, life events, risk factors
- Tab content renders below in remaining space

### Changes — Single file: `src/components/exec-demo/ExecDemoIntelPanel.tsx`

1. **Collapse persona card when a tab is active**: When `synthesisTriggered && activeTab`, change the persona card wrapper to:
   - Remove `flex-1` — no longer fills available space
   - Set `maxHeight` to a small value (~auto, no constraint) so it shrinks to content
   - Remove the life events section, risk factors section, and header text — only keep the rollup pills row in a single compact horizontal strip
   - The rollup pills become a dense, non-expandable summary bar

2. **Restructure the `synthesisTriggered && rollupStats.length > 0` branch** (lines 321–458):
   - When `activeTab` is set: render only the rollup pills row (lines 329–336) in a compact single-line style, hiding the "Behavioral Intelligence" header, life events, and risk factors
   - When `activeTab` is null: render the 3 action buttons (existing behavior from lines 286–320)

3. **Tab content gets `flex-1`**: The tab content section (lines 588–607) already has `flex-1` when `synthesisTriggered` — this will naturally expand upward when the persona card shrinks.

4. **Smooth transition**: The persona card already has `transition-all duration-700 ease-out` — the height collapse will animate smoothly.

### Visual result
- Click "Behavioral Intelligence: Ready" → 3 action buttons centered
- Click "Next-Offer" → top collapses to a slim pill strip, tab content expands up, phone slides in from right

