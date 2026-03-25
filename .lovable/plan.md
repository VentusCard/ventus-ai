

## Fix: Bank→Consumer connector lines should not light up before consumer nodes are ready

### Problem
On line 257 of `DemoNetworkDiagram.tsx`, the variable `pillarReady` for bank→consumer connectors is set to `engineReady`. This means these lines become solid and fully lit as soon as the enrichment engine finishes, even though the consumer-facing nodes (Personalized UX, Personalized Rewards, Personalized Relationship) haven't reached "ready" status yet.

### Fix — `src/components/demo/DemoNetworkDiagram.tsx`

**Line 257**: Change the readiness check to also require the consumer node to be ready:

```tsx
// Before
const pillarReady = engineReady;

// After
const consumerReady = engineReady && nodeReadiness[pillar.consumerNode.id] === "ready";
```

Then on **line 266**, replace `pillarReady` with `consumerReady`:

```tsx
<path d={path} stroke={pillar.consumerNode.color} strokeWidth={consumerReady ? 2 : 1} fill="none" opacity={consumerReady ? 0.6 : 0.15} strokeDasharray={consumerReady ? "none" : "4 3"} className="line-transition" />
```

This ensures the bank→consumer connector lines stay dashed/dim until their specific consumer node transitions to "ready", matching the gating behavior of the rest of the diagram.

