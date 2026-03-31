

## Function Set Selector — Controls Both Network Diagram & Analytics Dashboard

### Concept
A chip-based module selector in the customer panel lets the user pick which function sets are active. This filters:
1. **Network diagram** — only renders the PILLAR_ROWS for enabled modules
2. **Bank-wide analytics dashboard** — only shows nav groups for enabled modules

### Module → Row/Group Mapping

| Module | Diagram Row (PILLAR_ROWS) | Analytics NAV_GROUPS | Consumer Node |
|---|---|---|---|
| Analytics (always on) | `profiling` row (blue) | Analytics group | `engagement` |
| Rewards | `predictive` row (green) | Rewards group | `rewards` |
| Relationship | `phase` row (pink) | Relationship group | `wealth` |

"UX" is removed as a separate toggle — consumer nodes already follow their parent row. "All" is a convenience toggle.

### File Changes

**`src/types/demo.ts`** (new)
- Export `ModuleKey = "Analytics" | "Rewards" | "Relationship"`
- Export `ALL_MODULES` constant set

**`src/pages/DemoPage.tsx`**
- Add `enabledModules` state defaulting to all 3
- Pass down to `DemoCustomerPanel`, `DemoDetailOverlay`, `DemoNetworkDiagram`

**`src/components/demo/DemoCustomerPanel.tsx`**
- Accept `enabledModules` + `onModulesChange` props
- Add "Platform Modules" section between customer selector and enrich button
- Render chips: `All`, `Analytics` (locked/always-on), `Rewards`, `Relationship`
- Style: `rounded-full px-2.5 py-1 text-[10px] font-medium border` — active = blue-50/blue-700, inactive = slate-50/slate-400, Analytics = always active with lock icon

**`src/components/demo/DemoNetworkDiagram.tsx`**
- Accept `enabledModules` prop
- Filter `PILLAR_ROWS` based on module: profiling→Analytics, predictive→Rewards, phase→Relationship
- Analytics row always shown
- Filter `IMPACT_METRICS` array to match (index-aligned with rows)
- Recalculate vertical layout based on visible row count

**`src/components/demo/DemoDetailOverlay.tsx`**
- Accept `enabledModules`, forward to `AnalyticsContainer`

**`src/components/tepilot/insights/AnalyticsContainer.tsx`**
- Accept optional `enabledModules` prop
- Filter `NAV_GROUPS` to only show groups matching enabled modules (Home always visible)
- Auto-reset active tab to `ventus-ai` if current tab becomes hidden

