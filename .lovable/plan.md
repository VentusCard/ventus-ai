

## Draw Individual Lines from AE to Each Bank Node

Currently the Engine→Bank section (lines 188–207) draws **one line per pillar row** (3 lines total), each targeting the row's center Y. The user wants **one line per bank node** (6 lines total, 2 per row), matching the same visual style.

### Change

**File**: `src/components/demo/DemoNetworkDiagram.tsx`, lines 188–207

Replace the current `PILLAR_ROWS.map` that draws one path per pillar with a nested loop that draws one path per `bankNode`:

- For each pillar row, compute `contentTop` and iterate over `pillar.bankNodes` (2 per row)
- Calculate each bank node's vertical center: `contentTop + ni * (BANK_NODE_HEIGHT + BANK_NODE_GAP) + BANK_NODE_HEIGHT / 2`
- Draw a cubic bezier from `(engineRight, midY)` to `(bankColLeftX, bankNodeY)` — same curve shape, same stroke color (`pillar.color`), same width/opacity/dash logic, same processing and ready animated circles
- Keep all existing styling: `strokeWidth`, `opacity`, `strokeDasharray`, `className="line-transition"`, and the two `<circle>` animations

No other changes needed — geometry, node rendering, and bank→consumer lines stay the same.

