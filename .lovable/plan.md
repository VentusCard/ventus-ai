## Stop the upstream lifestyle detector from overwriting synthesize-persona pills

**File:** `src/pages/ExecDemoPage.tsx` (lines ~709–725)

### What's happening
- `firePersonaSynthesis` fires `synthesize-persona` and `analyze-lifestyle-signals` in parallel.
- When `synthesize-persona` finishes first, it hydrates the intel panel via `fireLifeEventDetection(...finalLifeEvents)` — these are the clean, taxonomy-correct pills the user briefly sees.
- Then `analyze-lifestyle-signals` resolves and the `.then` block re-merges its (older, less-accurate) events into `detectedLifeEvents`, causing the visible pills to shift ("get overwritten").

The block directly contradicts the stated policy in the comment three lines above it: *"Life events come EXCLUSIVELY from synthesize-persona"*.

### Fix
Delete the late-merge block at ExecDemoPage.tsx L709–725:

```ts
// Merge late-arriving upstream life events (dedup by lowercased event_name)
// without blocking the Ready button.
upstreamLifeEventsPromise.then((upstreamEvents) => { ... });
```

The upstream detector is still useful — its output is already passed into `synthesize-persona` as a dedup hint via `upstreamLifeEventsPromise` earlier in `firePersonaSynthesis`. Removing this post-hoc merge:
- Makes the intel panel show one stable set of pills (synthesize-persona's decision).
- Preserves the single authoritative taxonomy the comment already promises.
- Doesn't change latency (the promise is still awaited upstream for dedup).

### Scope
- One deletion, ~17 lines, in one file.
- No other files, no edge functions, no props changed.
