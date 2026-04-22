

## Collapse persona callouts to a single "V Orchestration" bubble

Remove the top label bubble (e.g. "✈ Leisure Traveler") and the vertical dashed connector that links it to the action bubble below. Each persona callout becomes a single bubble — the V Orchestration action bubble — anchored to its rows in the card by the existing horizontal dashed line.

The persona name is already visible as a highlighted pill inside the dark card during Stage 3, so repeating it in the callout was redundant.

### Visual change

**Before** (per persona):
```text
┌──────────────────────────┐
│ ✈ Leisure Traveler        │   ← removed
└────────────┬─────────────┘
             ┊                     ← removed
┌────────────┴─────────────┐
│ [V] ORCHESTRATION         │   ← kept (only bubble)
│ Curate leisure travel…    │
└──────────────────────────┘
```

**After**:
```text
┌──────────────────────────┐
│ [V] ORCHESTRATION         │
│ Curate leisure travel…    │
└──────────────────────────┘
```

### File touched

- `src/components/ScrollDrivenHero.tsx` (lines ~288–344)
  - Delete the top label bubble (`rounded-xl` with emoji + persona name)
  - Delete the vertical dashed `<svg>` connector
  - Keep the action bubble exactly as-is — V block, "Orchestration" label, action copy
  - The wrapping `<div className="flex flex-col items-stretch">` becomes a single child; that's fine, no further restructuring needed
  - The horizontal connector line + pulsing endpoint that anchors the callout to the card stays unchanged

No layout, color, or animation changes beyond removing the two elements. The remaining bubble keeps its persona-tinted text, dashed border, and Ventus blue V block.

