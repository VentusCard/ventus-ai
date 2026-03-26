

## Make Consumer Nodes & Impact Cards Full Color

### What
Change the "Personalized UX/Rewards/Relationship" cards and the impact metric cards from light tinted backgrounds to **solid colored backgrounds with white text**.

### Changes — `src/components/demo/DemoNetworkDiagram.tsx`

**Consumer nodes (lines ~434-449)**:
- `background`: from `${node.color}12` → `${node.color}` (solid color)
- `borderColor`: from `${node.color}70` → `${node.color}`
- Icon container: solid white/translucent-white background instead of tinted
- Icon color: white instead of `node.color`
- Text: `text-white` instead of `text-slate-900` / `text-slate-500`

**Impact metric cards (lines ~483-492)**:
- `background`: from `${impactData.color}12` → `${impactData.color}` (solid)
- `borderColor`: from `${impactData.color}30` → `${impactData.color}`
- Arrow icon + text: white instead of green/slate

~10 style property changes total. No structural changes.

