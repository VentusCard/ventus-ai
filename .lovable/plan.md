

## Fix: Cramped/Overlapping Diagram Layout

**Root cause**: The gap constants represent distances between column *centers*, but they're smaller than the combined half-widths of adjacent cards. This causes physical overlap.

**Card half-widths**:
- TX: 80px, Engine: 95px, Pillar: 77.5px, Leaf: 95px

**Current gaps vs. required minimums** (center-to-center):
- TX→Engine: 160 vs 175 needed (overlap!)
- Engine→Pillar: 150 vs 172.5 needed (overlap!)
- Pillar→Leaf: 130 vs 172.5 needed (overlap!)

### Fix in `src/components/demo/DemoNetworkDiagram.tsx`

Update the three gap constants to ensure ~50px visual spacing between card edges:

```
GAP_TX_ENGINE:    160 → 230   (50px visual gap)
GAP_ENGINE_PILLAR: 150 → 225  (52px visual gap)
GAP_PILLAR_LEAF:   130 → 220  (47px visual gap)
```

Total content width becomes: 80 + 230 + 225 + 220 + 95 = **850px**, which fits comfortably in the ~1200px panel area.

Also increase `LEAF_PAIR_OFFSET` from 28 → 32 to give the leaf node pairs a bit more vertical breathing room.

Single file change, 5 constant values.

