

## Make Engine Card Pills Clickable + Line Opens Enrichment

### What changes

1. **Engine card pills become individual clickable buttons** — each module pill navigates to its corresponding analytics section instead of the whole card opening enrichment.
2. **The SVG line connecting user node → engine node becomes clickable** — clicking it opens the enrichment panel (previously the engine card's behavior).

### Mapping: Module pill → node type

| Module | Opens node | Which routes to |
|---|---|---|
| Customer Intelligence | `analytics` | Lifestyle Analysis dashboard |
| AI & UX | `engagement` | Personalized AI & UX |
| Rewards | `travel` | Rewards Intelligence |
| Relationship | `lifeEvents` | Next-Product Automation |

### Implementation — `DemoNetworkDiagram.tsx`

1. **Engine card**: Change from a single `<button>` wrapping everything to a `<div>`. Remove the top-level `onClick={() => onNodeClick("engine")}`. Instead, each pill row gets its own `onClick` that calls `onNodeClick(targetNode)` with the mapped node type.

2. **Add a target node mapping** to `ENGINE_MODULE_CARDS`:
   ```ts
   { mod: "Analytics", label: "Customer Intelligence", ..., target: "analytics" as DemoNodeType },
   { mod: "AI & UX", label: "AI & UX", ..., target: "engagement" as DemoNodeType },
   { mod: "Rewards", label: "Rewards", ..., target: "travel" as DemoNodeType },
   { mod: "Relationship", label: "Relationship", ..., target: "lifeEvents" as DemoNodeType },
   ```

3. **SVG input line (TX → engine)**: Add an invisible wider `<path>` (stroke-width ~12, transparent) on top of the visible line with `cursor: pointer` and `onClick={() => onNodeClick("engine")}`. This makes the line clickable and opens the enrichment panel.

4. **Styling**: Pills get hover states (`hover:scale-[1.02]`, cursor pointer when engine is ready). The clickable line gets `pointer-events: all` and `cursor: pointer`.

