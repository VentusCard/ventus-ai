

## Fix: Life Event Detection Shows Wrong Customer Data

### Root Cause
Race condition in `src/hooks/useDemoEnrichment.ts`. When classifications complete, results are pushed to an array with `classifiedResults.push(classified)` (line 316). Then `maybeStartPhase2` assumes `classifiedResults[0]` = customer A and `[1]` = customer B (lines 208-209). But whichever classification finishes first gets index 0 -- so if B finishes first, the lifestyle signals for "Sarah" are run against James's transactions and vice versa.

Edge function logs confirm this: the `analyze-lifestyle-signals` call for "James Rodriguez" received Sarah's SAT/Stanford/Kaplan transactions, and Sarah's call received James's wellness transactions.

### Fix (single file: `src/hooks/useDemoEnrichment.ts`)

1. Replace `classifiedResults: EnrichedTransaction[][]` (unordered array) with a keyed object: `classifiedResults: { a?: EnrichedTransaction[]; b?: EnrichedTransaction[] }`.

2. Change `onClassified` to two separate callbacks -- `onClassifiedA` and `onClassifiedB` -- that store results under the correct key:
   ```ts
   const onClassifiedA = (classified: EnrichedTransaction[]) => {
     classifiedResults.a = classified;
     maybeStartPhase2();
   };
   const onClassifiedB = (classified: EnrichedTransaction[]) => {
     classifiedResults.b = classified;
     maybeStartPhase2();
   };
   ```

3. Update `maybeStartPhase2`:
   - Guard: `if (!classifiedResults.a || !classifiedResults.b || phase2Started) return;`
   - Use `classifiedResults.a` and `classifiedResults.b` instead of `[0]` and `[1]`

4. Pass the correct callback to each enrichment call:
   ```ts
   enrichA.startEnrichment(txnsA, undefined, onClassifiedA);
   enrichB.startEnrichment(txnsB, undefined, onClassifiedB);
   ```

This guarantees Sarah's classified transactions go to Sarah's lifestyle analysis and James's go to James's, regardless of which classification finishes first.

