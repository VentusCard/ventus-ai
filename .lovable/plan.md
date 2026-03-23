

## Fix Cramped Diagram — Tighter Distribution, Not Taller

The problem is horizontal waste + oversized elements, not insufficient height. The non-centered state has big gaps between TX/Engine but then crams bank+consumer columns together.

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

### 1. Shrink node sizes in non-centered state
- `BANK_NODE_HEIGHT`: min `34` → `32`
- `CONSUMER_NODE_HEIGHT`: min `70` → `62`
- `QUESTION_LABEL_HEIGHT`: non-centered `24` → `20` (subtitle sits tighter above nodes)

### 2. Reduce font sizes for non-centered subtitle
- Pillar subtitle icon: keep `w-4 h-4` but reduce to `w-3.5 h-3.5` in non-centered
- Pillar subtitle text: `text-[13px]` → `text-[12px]` in non-centered (keeps `text-[15px]` when centered)

### 3. Redistribute horizontal space
- `gap1` (TX→Engine): reduce min from `30` to `20` — these two don't need so much air
- `gap2` (Engine→Bank): increase min from `25` to `35` — give the bank column more breathing room from engine
- `gap3` (Bank→Consumer): increase min from `20` to `30` — stop bank and consumer columns from touching

This shifts horizontal budget from the left side (where it's wasted) to the right side (where it's cramped), while making nodes more compact vertically so three rows distribute comfortably without increasing `ROW_HEIGHT`.

