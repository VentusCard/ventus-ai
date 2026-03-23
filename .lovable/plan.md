

## Remove Column Headers, Add Color-Coded Cards + Legend

### Problem
The "Consumer Facing" and "Bank Facing" text headers take up space and are redundant once cards are visually differentiated. Both Financial Journey and Wealth Management are bank-facing, so the distinction should be clear via color coding rather than labels.

### Change

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

1. **Remove the column headers** (lines 286-293) — delete the "Consumer Facing" / "Bank Facing" `<div>` block. Reclaim the `GRID_HEADER_HEIGHT` space or reduce it to a small gap.

2. **Color-code the node buttons** by audience type:
   - **Consumer-facing** nodes (Personalized UX, Consumer Rewards, Financial Journey): add a subtle left border accent in amber/orange (`border-l-3 border-l-amber-400`)
   - **Bank-facing** nodes (Bank-Wide Analytics, Reward Intelligence, Wealth Management): add a subtle left border accent in blue (`border-l-3 border-l-blue-400`)

   Add an `audience` field to `NodeDef` and the PILLARS data:
   - `engagement` → consumer, `analytics` → bank
   - `rewards` → consumer, `travel` → bank
   - `lifeEvents` → bank, `wealth` → bank

   Wait — the user said "both financial journey and wealth management are bank-facing." So the Phase row has both as bank-facing. Let me map correctly:
   - Consumer: `engagement`, `rewards`
   - Bank: `analytics`, `travel`, `lifeEvents`, `wealth`

3. **Add a compact legend** at the bottom of the grid area:
   ```text
   ● Consumer-Facing    ● Bank-Facing
   ```
   Small dots with the accent colors, `text-[9px]` styling, positioned below the last grid row.

### Files Modified
- `src/components/demo/DemoNetworkDiagram.tsx`

