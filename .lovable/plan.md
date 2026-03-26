

## Updated Plan: Normalize Network Diagram Node Colors

Same approach as before — one color per row shared across bank nodes, consumer node, and impact metric — but replacing purple for Row 3 since the engine capabilities column already uses purple/indigo tones.

### Color assignments

| Row | Color | Hex | Applies to |
|-----|-------|-----|------------|
| Analytics | Blue | `#3b82f6` | 3 bank nodes + Personalized UX + impact row 1 |
| Rewards | Green | `#22c55e` | 3 bank nodes + Personalized Rewards + impact row 2 |
| Growth & Wealth | **Rose/Pink** | `#f43f5e` | 3 bank nodes + Personalized Relationship + impact row 3 |

Engine capabilities stay as-is (`#6366f1`, `#8b5cf6`, `#a78bfa`).

### Changes — `src/components/demo/DemoNetworkDiagram.tsx`

Update ~12 color strings across `PILLAR_ROWS` and `IMPACT_METRICS`. No structural changes.

