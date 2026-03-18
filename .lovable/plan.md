

## Make the Network Diagram Bigger & Wider

The diagram currently uses fixed pixel gaps (230/225/220px) between columns and fixed node sizes that don't scale with available space. On a 1504px viewport with a ~35% left panel, the diagram container is ~975px wide but the content only spans ~875px, leaving unused margins. Nodes are also quite small.

### Changes in `src/components/demo/DemoNetworkDiagram.tsx`

**1. Increase all node sizes**
- `TX_CARD_WIDTH`: 160 → 180
- `TX_CARD_HEIGHT`: 100 → 110
- `ENGINE_WIDTH`: 190 → 210
- `ENGINE_HEIGHT`: 220 → 245
- `PILLAR_WIDTH`: 155 → 175
- `PILLAR_HEIGHT`: 78 → 88
- `LEAF_NODE_WIDTH`: 190 → 210
- `LEAF_NODE_HEIGHT`: 44 → 52

**2. Increase horizontal gaps**
- `GAP_TX_ENGINE`: 230 → 260
- `GAP_ENGINE_PILLAR`: 225 → 255
- `GAP_PILLAR_LEAF`: 220 → 250

**3. Increase vertical spread**
- `LEAF_PAIR_OFFSET`: 32 → 38
- Pillar spacing clamp: change `Math.min(Math.max(dims.h * 0.22, 100), 180)` to `Math.min(Math.max(dims.h * 0.24, 110), 200)`

**4. Bump font sizes throughout**
- Engine "V" logo: `text-lg` → `text-xl`, icon container `w-10 h-10` → `w-11 h-11`
- Engine label: `text-[11px]` → `text-[12px]`
- Engine capabilities text: `text-[9px]` → `text-[10px]`
- Pillar name: `text-[10px]` → `text-[11px]`
- Pillar subtitle: `text-[9px]` → `text-[9px]` (keep, already readable)
- Leaf node label: `text-[10px]` → `text-[11px]`
- Leaf node status: `text-[8px]` → `text-[9px]`
- TxCard text sizes bumped by 1px each

Single file edit — geometry constants, font sizes, and the pillar spacing formula.

