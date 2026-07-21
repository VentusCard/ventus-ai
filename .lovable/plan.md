## Goal
Show the "Behavioral Intelligence — Ready" button ASAP by firing `analyze-lifestyle-signals` and `synthesize-persona` **in parallel** the moment classification finishes, instead of the current serial chain.

## Current chain (serial)
`classify-transactions` → `analyze-lifestyle-signals` (awaited, ~8-15s) → `synthesize-persona` (~8-15s) → Ready button appears.

## Target chain (parallel)
`classify-transactions` → `[analyze-lifestyle-signals ∥ synthesize-persona]` → Ready button appears as soon as persona resolves. Life-event pills fill in when lifestyle-signals resolves (may be before or after persona).

## Change — single file: `src/pages/ExecDemoPage.tsx`

### 1. `firePersonaSynthesis` (around lines 315-325 and 375)
- Remove the `await detectLifeEventsOnlyRef.current()` blocker.
- Kick it off non-blocking right at the top of the function:
  ```ts
  const upstreamLifeEventsPromise = detectLifeEventsOnlyRef.current()
    .catch((e) => { console.warn("[PRELOAD] upstream life events failed:", e); return [] as LifeEvent[]; });
  ```
- In the `synthesize-persona` invoke body, pass `lifeEvents: []` (the upstream dedup hint is skipped — client-side merge handles dedup instead).
- After `synthesize-persona` returns and `finalLifeEvents` is built (existing code around line 691-718), keep firing `fireLifeEventDetection(synthesis, pillars, finalLifeEvents)` immediately so the Ready button and downstream product/offer calls unblock without waiting for the upstream promise.
- Then, chain the upstream promise to merge late arrivals:
  ```ts
  upstreamLifeEventsPromise.then((upstreamEvents) => {
    if (!upstreamEvents.length) return;
    const seen = new Set(
      (detectedLifeEventsRef.current || []).map((e) => e.event_name.toLowerCase().trim())
    );
    const additions = upstreamEvents.filter(
      (e) => e?.event_name && !seen.has(e.event_name.toLowerCase().trim())
    );
    if (additions.length === 0) return;
    const merged = [...(detectedLifeEventsRef.current || []), ...additions].slice(0, 3);
    detectedLifeEventsRef.current = merged;
    setDetectedLifeEvents(merged);
    console.log("[PRELOAD] Merged", additions.length, "late upstream life events");
  });
  ```

### 2. No other files change
- `analyze-lifestyle-signals` and `synthesize-persona` edge functions untouched.
- Ready button gate in `ExecDemoIntelPanel.tsx` (line 1508: `hasSynthesis && !synthesisTriggered && phase === "hold"`) works as-is — it flips true the moment `personaSynthesis` state is set.
- `detectLifeEventsOnly` helper stays as-is.
- Risk detection race (6s cap, already parallel) stays as-is.

## Expected result
Ready button appears after roughly `classify + persona` (~18-30s) instead of `classify + life-events + persona` (~25-45s). Both LLM outputs still ship; late-arriving upstream life events merge into the pill row with lowercased-name dedup so no duplicates appear.

## Trade-off (acknowledged)
Without the upstream dedup hint in the persona prompt, the persona LLM may emit a life-event name that also appears in the upstream detector's output. The client-side lowercased-name dedup during the late merge covers exact-name overlaps. Near-duplicates with different phrasings are possible but rare and cosmetic.
