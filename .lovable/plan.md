

## Separate MCC source data from AI classification in tooltips

**Goal**: Tooltip row 1 (MCC code + description) comes from the raw CSV sample data. Row 2 (pillar, category, subcategory, tier, frequency) comes from the classify-transactions AI function results.

### Current problem
When AI classification arrives, `buildSignalMapFromClassified` creates a new signal map with only `pillar`, `label`, `amount`, `frequency` — it discards the `mcc`, `mccDescription`, `category`, and `tier` fields that were present in the MCC-based fallback map.

### Changes

**`src/components/exec-demo/execDemoData.ts`**:
- Update `buildSignalMapFromClassified` to accept an optional `csv` parameter
- Parse MCC codes and descriptions from the CSV rows (same logic as `buildSignalMap`)
- Merge: MCC + mccDescription from CSV, pillar/category/label/tier/frequency from the AI `EnrichedTransaction` results
- Map `subcategories[0]` from AI results into the `label` field (subcategory)
- Map `spending_tier` into `tier`

**`src/pages/ExecDemoPage.tsx`**:
- Pass the CSV string to both calls of `buildSignalMapFromClassified(classifiedRef.current, csv)` so MCC data is preserved

### Result
- Tooltip Row 1 always shows MCC code + description from raw CSV data
- Tooltip Row 2 shows AI-enriched pillar, category, subcategory, tier, and frequency
- When AI hasn't loaded yet, MCC fallback map still provides all fields as before

