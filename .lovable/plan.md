

## Plan: Update Impact Metrics Text and Adjust Purple Row Layout

### Changes — `src/components/demo/DemoNetworkDiagram.tsx`

**1. Text updates (line 86-90)**
- Change `"Higher Loyalty"` → `"High Profitability"` in the green row
- Add `"Higher Advisor Effectiveness"` as a 4th metric in the purple row

**2. Adjust connector line for purple row (line 258-276)**
The purple row (index 2) will now have 4 impact cards instead of 3. The connector line currently targets `consumerCenterY` which is the center of the consumer node. This stays the same — the line connects consumer node center to the center of the 4-card stack. The impact card container height needs to increase to fit 4 items, so we adjust the `height` style for the impact column when `impactData.metrics.length > 3` — or simply remove the fixed `CONSUMER_NODE_HEIGHT` constraint and let flexbox handle it. The connector line endpoint Y should target the visual center of the 4 cards.

**Specifically:**
- Remove the fixed `height: CONSUMER_NODE_HEIGHT` from the impact container and let it auto-size, keeping `top` adjusted so the group is vertically centered in the row.
- For the connector line, keep targeting `consumerCenterY` (center of the row) which will naturally align with the center of 4 cards since both are centered on the same row center.

### Files modified
- `src/components/demo/DemoNetworkDiagram.tsx`

