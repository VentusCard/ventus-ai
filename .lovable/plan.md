

## Redesign: Dynamic Engine Node Cards Based on Module Selection

### What changes
The "Advanced Enrichment" engine card in `DemoNetworkDiagram.tsx` currently shows 3 static capability rows. It will be updated to show 1–4 cards matching the enabled modules from demo settings.

### Card mapping

| Module Key | Label | Color | Icon |
|---|---|---|---|
| Analytics (always on) | Ventus AI Customer Intelligence & Analytics | `#3b82f6` (blue) | BarChart3 |
| AI & UX | AI & UX | `#60a5fa` (sky) | Smartphone |
| Rewards | Rewards | `#22c55e` (green) | Gift |
| Relationship | Relationship | `#ec4899` (pink) | Heart |

### Implementation — single file edit: `src/components/demo/DemoNetworkDiagram.tsx`

1. **Replace `ENGINE_CAPABILITIES`** with a new `ENGINE_MODULE_CARDS` array that maps each `ModuleKey` to a label, icon, and color (matching the MODULE_CONFIG colors from the settings panel).

2. **Filter dynamically** — inside the component, compute `visibleEngineCards` by filtering `ENGINE_MODULE_CARDS` against `enabledModules`. Analytics is always included since it's always enabled.

3. **Update the engine card rendering** (lines 335–344) to iterate over `visibleEngineCards` instead of `ENGINE_CAPABILITIES`, keeping the same visual style (colored pill rows with icon + label).

4. **Adjust `ENGINE_MIN_HEIGHT`** dynamically based on the number of visible cards so the node resizes gracefully (e.g. base height + per-card increment).

