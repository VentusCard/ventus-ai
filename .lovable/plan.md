

## Plan: Add "Impact" Column to Network Diagram

### What
Add a 5th column to the right of the consumer-facing nodes showing business outcomes. Each row gets 3 "Higher ___" metric badges that fade in once the consumer node is ready.

### Content

| Row | Consumer Node | Impact Metrics |
|-----|--------------|----------------|
| 1 | Personalized UX | Higher Engagement · Higher App Usage · Higher NPS |
| 2 | Personalized Rewards | Higher Redemption · Higher Spend Lift · Higher Loyalty |
| 3 | Personalized Relationship | Higher Cross-Sell · Higher AUM Growth · Higher Lifetime Value |

### Layout
```text
[TX Cards] → [Engine] → [Bank-Facing] → [Consumer-Facing] → [Impact]
```

### Changes — `src/components/demo/DemoNetworkDiagram.tsx`

1. **Add Impact column data** — define `IMPACT_METRICS` array mapping each pillar row index to its 3 metrics with colors
2. **Expand layout math** — add `IMPACT_COL_WIDTH` and `gap4`, include them in `totalContentWidth` and compute `impactColLeftX = consumerColLeftX + CONSUMER_COL_WIDTH + gap4`
3. **Add SVG connector lines** — draw a short curved line from each consumer node to its impact card (same pattern as bank→consumer lines)
4. **Render impact cards** — for each pillar row, render a card at `impactColLeftX` containing 3 stacked "Higher ___" badges with upward-arrow icons. Cards use a fade/slide-in transition triggered when the consumer node's readiness is `"ready"`
5. **Add "Impact" column header** — positioned above the impact column, matching the style of "Bank-Facing" and "Consumer-Facing" headers

### Visual Style
- Each metric badge: small green upward arrow icon + "Higher ___" text
- Card background: subtle green tint when active, grey when waiting
- Staggered fade-in animation (each badge delays 200ms after the previous)

### Files Modified
- `src/components/demo/DemoNetworkDiagram.tsx` (only file)

