

## Restructure Network Diagram: 4-Column Layout with Bank Analytics → Consumer Views

### What Changes
Replaced the 3-row grid (each with 2 side-by-side nodes) with a **4-column flow**:

```text
TX Cards → Engine → Bank Analytics (3 rows, 2 stacked items each) → Consumer Views (3 single cards)
```

| Pillar | Bank Analytics (Col 3) | Consumer View (Col 4) |
|---|---|---|
| Profiling | Behavioral Analytics, Outflow Analysis | Personalized UX |
| Predictive | Reward Intelligence, Locational Experience | Consumer Rewards |
| Phase | Life Event Intelligence, Financial Journey | Wealth Management |

### Files Modified
- `src/components/demo/DemoNetworkDiagram.tsx` — 4-column layout with PillarRow data model
- `src/hooks/useDemoEnrichment.ts` — Added outflow, locational, lifeEventIntel node types
- `src/components/demo/DemoDetailOverlay.tsx` — Route new nodes to existing views
- `src/pages/DemoPage.tsx` — Updated NODE_ORDER
