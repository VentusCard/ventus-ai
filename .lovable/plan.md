

## Fix Centered (Close-Panel) State: Remove Pulse, Bigger & Spaced Out

The user wants changes **only in the centered (close-panel) state**. Three issues:

### 1. Remove `animate-pulse` from AE card during processing
- Lines 261 and 268: Remove the `animate-pulse` class that fires when `engineProcessing && !engineReady`
- The processing state glow via `boxShadow` on line 257 is sufficient feedback

### 2. Make elements bigger in centered mode
Current centered values are too conservative. Increase:
- `TX_CARD_WIDTH`: `Math.min(180, ...)` → `Math.min(220, dims.w * 0.14)`
- `ENGINE_WIDTH`: `Math.min(200, ...)` → `Math.min(240, dims.w * 0.16)`
- `BANK_COL_WIDTH`: `Math.min(220, ...)` → `Math.min(260, dims.w * 0.18)`
- `CONSUMER_COL_WIDTH`: `Math.min(200, ...)` → `Math.min(240, dims.w * 0.16)`
- `BASE_ENGINE_MIN_HEIGHT * scale` stays, but scale already 1.25

### 3. Space out more in centered mode
Increase the centered gaps:
- `gap1`: `40` → `50`
- `gap2`: `50` → `60`
- `gap3`: `40` → `55`
- `txSpread`: `70` → `85` (customer cards further apart vertically)

**File**: `src/components/demo/DemoNetworkDiagram.tsx`

