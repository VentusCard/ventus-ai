

## Ungate "Next-Purchase Intelligence" & "Travel & Perk Aggregation" from Travel Algorithm

### Problem
Currently, the `travel` and `locational` nodes only become "ready" after both the travel-detection AI call and local-experiences fetch complete. This makes them appear slow. The user wants them to light up as soon as `dealPersonalization` is ready (which fires earlier, after classification).

### Change — `src/hooks/useDemoEnrichment.ts`

**Set `travel` and `locational` to "ready" alongside `dealPersonalization`** (~line 340):
- Where rewards/dealPersonalization are set ready, also set `travel` and `locational` ready:
  ```ts
  setNodeReady({ rewards: "ready", dealPersonalization: "ready", travel: "ready", locational: "ready" });
  ```

**Keep the travel/local-experiences fetches running** — they still populate data (detected trips, local experiences), but they no longer gate the node's visual readiness.

**Remove the `maybeSetTravelReady` gating logic** (~lines 431-487):
- Remove the `localExperiencesDone`/`travelDetectionDone` booleans and the `maybeSetTravelReady` function
- Keep the actual fetch calls (travel-detection, local-experiences) — just remove the `setNodeReady` calls from their `.then()` blocks since readiness is already set earlier

**Update the "already enriched" guard** (~line 235):
- Change `nodeReadiness.travel === "ready"` check to `nodeReadiness.dealPersonalization === "ready"` (or just `rewards`) since travel readiness now fires earlier with deal personalization

### Result
- "Next-Purchase Intelligence" and "Travel & Perk Aggregation" light up at the same time as "Deep Personalization"
- Travel data still loads in the background and populates when ready
- No visual delay waiting for the travel algorithm

