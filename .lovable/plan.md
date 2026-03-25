

## Tighten Vertical Spacing in Network Diagram

### Changes — `src/components/demo/DemoNetworkDiagram.tsx`

Reduce three spacing constants:

| Constant | Current | New |
|---|---|---|
| `ROW_HEIGHT` | `Math.max(145, 170 * scale)` | `Math.max(125, 148 * scale)` |
| `BANK_NODE_GAP` | `Math.max(7, 10 * scale)` | `Math.max(4, 6 * scale)` |
| `CONSUMER_NODE_HEIGHT` | `Math.max(62, 80 * scale)` | `Math.max(54, 70 * scale)` |

This compresses the three pillar rows closer together, tightens gaps between bank nodes within each row, and slightly shortens consumer node cards — all producing a more compact vertical layout. No other files affected.

