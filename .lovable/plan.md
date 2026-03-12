

## Plan: Add "Enrich" Button to Demo Page

### What Changes

**1. `src/lib/demoData.ts`** — Add `csv` and `zip` fields to each `DemoCustomer`

Map each customer to their corresponding CSV constant and zip code:
- c1 (Sarah) → `SAMPLE_CSV`, `94102`
- c2 (James) → `SAMPLE_CSV_SPORTS_WELLNESS`, `78701`
- c3 (Emily) → `SAMPLE_CSV_FOOD_HOME`, `60614`
- c4 (Michael) → `SAMPLE_CSV_TRAVEL_FAMILY_12`, `94102`
- c5 (Amanda) → `SAMPLE_CSV_NYC_SPORTS_HOME_12`, `10003`
- c6 (Robert) → `SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12`, `60610`

**2. `src/components/demo/DemoCustomerPanel.tsx`** — Add Enrich button at bottom

- Accept new props: `onEnrich`, `isProcessing`, `statusMessage`, `currentPhase`
- Render an "Enrich Both Customers" button below the two customer slots (replaces the hint text at bottom)
- Show processing state with spinner and phase text (Classifying → Travel Detection → Complete)
- Button uses the existing `Button` component with `variant="ai"`

**3. `src/pages/DemoPage.tsx`** — Wire up enrichment

- Import `useSSEEnrichment` (two instances, one per customer)
- Import `parsePastedText` to convert the CSV strings into `Transaction[]`
- `onEnrich` handler: parse both customers' CSVs, call `startEnrichment()` for both in parallel
- Pass enrichment results + loading state down to `DemoCustomerPanel` and detail views
- Cache: skip re-enrichment if customer hasn't changed since last enrichment

**4. Detail views** — Accept optional live data (future step, not blocking)

For now, the enrichment fires and results are stored in state. The detail views continue showing static data. Wiring live results into the overlay views will be a follow-up.

### Flow

```text
User selects Customer A & B → clicks "Enrich Both"
  ├─ Parse CSV A → startEnrichment(txnsA, zipA)
  └─ Parse CSV B → startEnrichment(txnsB, zipB)
       ├─ Phase 1: classify-transactions (SSE) — both in parallel
       └─ Phase 2: travel-detection — both in parallel
  → Button shows progress → "Complete" state
```

### Files Modified
- `src/lib/demoData.ts` — add `csv` + `zip` fields
- `src/components/demo/DemoCustomerPanel.tsx` — add Enrich button + progress UI
- `src/pages/DemoPage.tsx` — wire `useSSEEnrichment` × 2, parse CSVs, handle enrich click

