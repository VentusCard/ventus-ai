

## Suppress All Toast Notifications on /demo

### Problem
Multiple toast notifications fire during demo enrichment — "75 transactions classified!", "travel patterns detected!", "Already enriched", and error toasts. The user wants none of them on the `/demo` page.

### Plan

**File: `src/hooks/useSSEEnrichment.ts`**
- Add `suppressToasts?: boolean` to the `startEnrichment` options/parameters.
- Wrap all 5 `toast.*()` calls (lines 165, 199, 301, 356, 364) with `if (!suppressToasts)`.

**File: `src/hooks/useDemoEnrichment.ts`**
- Pass `suppressToasts: true` when calling `startEnrichment`.
- Remove or guard the two local `toast.*()` calls (lines 237, 468) so they never fire on /demo.

This keeps toasts working on the TePilot enrichment page while silencing them entirely on `/demo`.

