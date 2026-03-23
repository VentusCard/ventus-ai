

## Gate Consumer Nodes Behind Their Bank-Facing Counterparts

**File: `src/hooks/useDemoEnrichment.ts`**

### Problem
Consumer-facing nodes (rewards, wealth, engagement) can currently show "ready" before or simultaneously with their bank-facing counterparts, which breaks the visual narrative of "bank analysis feeds consumer experience."

### Current readiness order
| Node | When it fires ready |
|------|-------------------|
| analytics, outflow | Immediately with engine |
| travel, locational | When local-experiences + travel-detection complete |
| lifeEventIntel, lifeEvents | When lifestyle signals complete |
| **rewards** | When deal personalization completes — **can beat travel/locational** |
| **wealth** | When lifestyle signals complete — **same time as lifeEvents** |
| **engagement** | When lifestyle + tips complete — already after analytics ✓ |

### Desired order
Each consumer node must wait until **both** of its row's bank-facing nodes are ready:
- `engagement` → after `analytics` + `outflow` (already naturally true)
- `rewards` → after `travel` + `locational`
- `wealth` → after `lifeEventIntel` + `lifeEvents`

### Implementation
Add a gating layer using a ref that tracks pending consumer-node readiness. When a consumer node tries to become "ready", check if its bank-facing dependencies are already ready. If not, queue it. When bank-facing nodes become ready, flush any queued consumer nodes whose dependencies are now met.

Specifically:
1. Add a `pendingConsumerRef` to hold queued consumer readiness and a mapping of consumer→bank dependencies.
2. Wrap the existing `setNodeReady` with logic that, when setting a consumer node ready, checks if its bank deps are met; if not, queues it.
3. When bank nodes become ready, check if any queued consumer nodes can now flush.
4. Add a small stagger delay (~300ms) before flushing consumer nodes so the "light-up" sequence is visually clear even when bank nodes finish just before consumer ones.

