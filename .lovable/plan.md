## Drop the unused `analyze-lifestyle-signals` call from /bankdemo

`analyze-lifestyle-signals` is still used by other surfaces (`AdvisorConsolePage`, `TePilot`, `useDemoEnrichment`, and referenced by `DemoPillarCodeView` for the systems walkthrough), so the edge function itself stays.

But inside `src/pages/ExecDemoPage.tsx` (the /bankdemo demo tab) it is now dead weight:

- L320: `upstreamLifeEventsPromise = detectLifeEventsOnlyRef.current()` fires the call.
- After the previous edit removed the late-merge `.then`, nothing ever awaits or reads the promise.
- Life-event pills are now driven exclusively by `synthesize-persona`'s `detected_life_events`.
- Keeping the fetch just burns model latency and credits on every demo run.

### Edit (single file: `src/pages/ExecDemoPage.tsx`)

1. **Remove the upstream detector call in `firePersonaSynthesis`** (L317–325). Delete the `upstreamLifeEventsPromise` block and the comment above it.
2. **Remove the stale comment reference** at L709–713 that mentions `upstreamLifeEventsPromise`.
3. Keep `detectLifeEventsOnly`, `detectLifeEventsOnlyRef`, and the `preDetectedEvents` argument to `fireLifeEventDetection` — they're still used elsewhere in the same file (e.g., the fallback path in `fireLifeEventDetection` when `preDetectedEvents` is not supplied), so no other deletions are needed.

### Not touched
- `supabase/functions/analyze-lifestyle-signals/index.ts` — still needed by other pages.
- `DemoPillarCodeView.tsx` walkthrough — describes the systems architecture, not the /bankdemo runtime.
- All other files.

Net effect: one fewer LLM call per /bankdemo demo run, no visible behavior change.
