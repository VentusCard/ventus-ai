

## Plan: Hide Impact Column Completely Until Ready

Change 3 spots in `src/components/demo/DemoNetworkDiagram.tsx` to use `opacity: 0` instead of showing dimmed/placeholder states:

1. **Connector lines** (line 270): Change `opacity={consumerReady ? 0.5 : 0.1}` → `opacity={consumerReady ? 0.5 : 0}`
2. **Impact cards** (line 454): Change `opacity: consumerReady ? 1 : 0.3` → `opacity: consumerReady ? 1 : 0`
3. **"Impact" header** (line 491-496): Wrap with opacity based on whether *any* consumer node is ready: `opacity: anyConsumerReady ? 1 : 0` with transition

### File modified
- `src/components/demo/DemoNetworkDiagram.tsx`

