

## Preload Classification on Customer Select, Show on Process

### Problem
Currently, `classify-transactions` is never called in the exec demo. The user wants it to fire eagerly when a customer is selected (preloading in the background), but only visually apply the results when "Process" is clicked.

### Flow

```text
Customer selected → classify-transactions fires silently in background
                    results cached in state (classifiedRef)

User clicks "Process" → animation starts
                        if classified results ready → use AI pillars for signals
                        if not ready yet → use MCC fallback, merge AI when it arrives
```

### Changes

**1. `src/pages/ExecDemoPage.tsx`**
- Add a `classifiedRef = useRef<EnrichedTransaction[] | null>(null)` and `classifyingRef = useRef<boolean>(false)` to cache preloaded results
- In `handleSelectCustomer`: after setting the selected index, fire `classify-transactions` in the background via direct fetch (same pattern as `useSSEEnrichment`). Parse the SSE stream silently, store `enriched_transactions` in `classifiedRef`. No UI state updates during preload.
- In `handleLoadCustomCsv`: same — fire classification for the custom CSV
- In `handleRunAnalysis`: check `classifiedRef.current`. If results exist, call a new `buildSignalMapFromClassified()` to create a richer signal map before building the local profile. If not ready, proceed with MCC fallback as today. Set up a listener so when classification completes mid-animation, merge the new signals into the profile state.
- Add cleanup: clear `classifiedRef` and abort any in-flight fetch when customer changes

**2. `src/components/exec-demo/execDemoData.ts`**
- Add `csvToClassifyPayload(csv: string)` — converts CSV rows into `{ transaction_id, merchant_name, amount, date }[]` format expected by the edge function
- Add `buildSignalMapFromClassified(enrichedTxs: any[]): Record<number, SignalEntry>` — maps classify-transactions output (pillar, category, amount) into the `SignalEntry` format used by pills
- Export both functions

**3. `src/components/exec-demo/ExecDemoIntelPanel.tsx`**
- Add any missing pillar color keys from classify-transactions output (e.g. "Sports & Active Living", "Style & Beauty", "Digital & Tech") to `PILLAR_COLORS`
- No layout changes needed — pills already render from the signal map

### Files
1. `src/components/exec-demo/execDemoData.ts` — CSV-to-payload converter, classified signal map builder
2. `src/pages/ExecDemoPage.tsx` — preload on select, use cached results on process
3. `src/components/exec-demo/ExecDemoIntelPanel.tsx` — extend pillar color map

