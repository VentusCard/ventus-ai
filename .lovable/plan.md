

## Make Bank Node Cards Slightly Shorter

### Change
In `src/components/demo/DemoNetworkDiagram.tsx`, reduce `BANK_NODE_HEIGHT` from `Math.max(36, 42 * scale)` to `Math.max(32, 38 * scale)` — reverting to the previous value. This makes the "All-in-one Suite" bank node cards a tiny bit shorter vertically, closer in proportion to the consumer-facing cards like "Events in Richmond."

### File: `src/components/demo/DemoNetworkDiagram.tsx`
- Line 120: Change `Math.max(36, 42 * scale)` → `Math.max(32, 36 * scale)`

