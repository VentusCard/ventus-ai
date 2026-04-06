

## Show Enriched Pills Earlier

### Current Flow
1. User lands on `/demo` → default customer (Sarah) is selected
2. `fireClassification()` starts the AI call **only when user clicks a customer card**
3. User clicks "Behavioral Enrichment" → 10.5s animation runs with MCC fallback labels (e.g. "Grocery", "Airlines")
4. AI classification arrives mid-animation (3-8s) and silently upgrades pill labels

### Problem
If the user clicks "Behavioral Enrichment" quickly, they see generic MCC labels for several seconds before the AI labels swap in. The upgrade is also silent, so users may not notice the improvement.

### Proposed Fix: Preload on Page Mount

**`src/pages/ExecDemoPage.tsx`** — Add a `useEffect` on mount that immediately fires classification for the default customer (index 0):

```ts
useEffect(() => {
  fireClassification(getCsvForCustomer(0));
}, []); // fire on mount for default selection
```

This means by the time the user reads the UI, orients themselves, and clicks "Behavioral Enrichment" (~3-5s minimum), the AI classification will already be complete. Pills will appear with their enriched labels from the first frame of the animation.

### Why This Works
- The AI call takes 3-8s; users typically spend at least that long reading the page before clicking
- `handleRunAnalysis` already checks `classifiedRef.current` and uses AI labels if available
- No visual changes needed — the existing upgrade mechanism handles it seamlessly
- When a user switches customers, `handleSelectCustomer` already fires a new classification, so subsequent profiles also preload

### Single-file change
Only `ExecDemoPage.tsx` needs a ~3 line addition.

