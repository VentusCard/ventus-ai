

## Update All-in-one Suite Tool Labels

Rename the 7 bank-facing node labels in the network diagram to be more explicit about what each tool does.

### Current → Proposed Labels

| # | Current Label | Proposed Label |
|---|---|---|
| 1 | Behavioral Analytics | Category Consolidation & Budgeting |
| 2 | Outflow Analysis | Competitor Outflow Detection |
| 3 | Reward Intelligence | Reward & Trip Detection |
| 4 | Locational Experience | Locational Perk Aggregation |
| 5 | Life Event Intelligence | Life Event Detection |
| 6 | Financial Journey | Next-Best Product Engine |
| 7 | WM CoPilot | WM CoPilot *(keep)* |

I've inferred more descriptive names based on what each tool actually does in the codebase. Please let me know if you'd like to adjust any of these before I implement.

### File to update
- `src/components/demo/DemoNetworkDiagram.tsx` — lines 49-73, update the `label` strings in `PILLAR_ROWS`

### Also update matching labels in the analytics sidebar
- `src/components/tepilot/insights/AnalyticsContainer.tsx` — update sidebar tab labels to stay consistent (e.g. "Location Experience" → "Locational Perk Aggregation")

