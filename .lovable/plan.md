

## Expand All Pillars, Fire Tip Early, Gate Engagement Readiness

### Problem
1. Only the first 2 pillars are expanded by default — should be all 4.
2. The coaching tip fires lazily inside `PhoneMockup` when the overlay is opened, not at enrichment time.
3. The engagement node shows "ready" after lifestyle signals complete, but the coaching tip may still be loading when the user clicks in.

### Changes

#### 1. Expand all 4 pillars by default — `DemoEngagementView.tsx` (line 120)
Change `spending.slice(0, 2)` → `spending.slice(0, 4)` in the `expandedPillars` initializer so all pillars start expanded.

#### 2. Move coaching tip generation into `useDemoEnrichment` — `useDemoEnrichment.ts`
- Add state: `tipA`, `tipB`, `tipsReady` (boolean).
- In `maybeStartPhase2`, fire `generate-financial-tip` for both customers in parallel alongside lifestyle signals.
- Track when both tips resolve → set `tipsReady = true`.
- Only set `engagement: "ready"` when **both** lifestyle signals AND tips are complete.
- Return `tipA` and `tipB` from the hook.

#### 3. Pass pre-fetched tips through to DemoEngagementView
- **`DemoDetailOverlay.tsx`**: Accept `tipA`/`tipB` props, pass them to `DemoEngagementView`.
- **`DemoEngagementView.tsx`**: Accept optional `tipA`/`tipB` props, pass the correct one to each `PhoneMockup`.
- **`PhoneMockup`**: If a tip is provided via props, skip the internal `useEffect` fetch and use the prop directly. Remove the loading skeleton state when tip is pre-provided.

#### 4. Gate engagement readiness — `useDemoEnrichment.ts`
- Replace the current `setNodeReady({ wealth: "ready", engagement: "ready", lifeEvents: "ready" })` call.
- Track two flags: `lifestyleDone` and `tipsDone`. When both are true, set `engagement: "ready"`.
- `wealth` and `lifeEvents` still become ready when lifestyle signals complete (independent of tips).

### Files Modified
- `src/hooks/useDemoEnrichment.ts` — fire tips early, gate engagement on tips + lifestyle
- `src/components/demo/DemoDetailOverlay.tsx` — pass tips through
- `src/components/demo/DemoEngagementView.tsx` — accept tip props, expand all 4 pillars
- `src/pages/DemoPage.tsx` — pass tipA/tipB from hook to overlay (if overlay is rendered there)

