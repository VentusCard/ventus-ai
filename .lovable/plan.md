

## Add Subtle Gradient to Bank-Facing Cards

### What
Apply a subtle gradient background to each of the 3 bank-facing cards per row, similar to how the Advanced Enrichment engine capability cards look — but using a gradient from `color + 08` to `color + 18` (light wash to slightly stronger wash).

### Changes — `src/components/demo/DemoNetworkDiagram.tsx`

**Line 391** — Replace the flat `background` on bank node buttons:

```typescript
// Before
background: canOpen ? `${node.color}15` : "#ffffff",

// After
background: canOpen
  ? `linear-gradient(135deg, ${node.color}08 0%, ${node.color}20 100%)`
  : "#ffffff",
```

Single line change. No structural changes needed.

