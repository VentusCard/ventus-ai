

## Rename Engine Node to "Advanced Enrichment" & Redesign Card

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

### Changes (lines ~259–275)

1. **Remove the "V" logo block** — delete the `div` with the rounded-xl indigo square containing the bold "V" letter (lines 260-262).
2. **Rename title** — change `"Ventus AI Engine"` to `"Advanced Enrichment"` (line 263).
3. **Adjust card design** — without the large logo icon taking up space, add a small `Layers` icon inline next to the title text instead, keeping the card compact. Reduce top padding since the big square icon is gone.

### Result
The engine card will show:
- A compact header: small Layers icon + "Advanced Enrichment" title
- The three capability rows below (Semantic Enrichment, Cross-category Patterns, Deep Purchase Analysis) unchanged
- Same interaction behavior (click when ready, processing animation, etc.)

