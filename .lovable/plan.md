

## Remove Comparison Mode from /tepilot

### Changes

**File 1: `src/components/tepilot/UploadOrPasteContainer.tsx`**
- Remove `onLoadComparisonSamples` prop from interface
- Remove `Checkbox`, `Badge`, `toast` imports (no longer needed)
- Remove `selectedIndices` state and `handleToggleDataset` multi-select logic
- Replace with simple `handleSelectDataset(index)` that calls `onLoadSample` directly
- Remove "Select 1 for single view, or 2 to compare" helper text
- Remove Badge showing selected count on dropdown trigger
- Update description to just "Upload files or paste your transaction data to get started."
- Dropdown items become simple click-to-select (no checkboxes, no preventDefault)

**File 2: `src/pages/TePilot.tsx`**
- Remove imports: `ComparisonDashboard`, `ComparisonRewardsView`
- Remove state variables (lines 119-125): `comparisonMode`, `selectedCompA`, `selectedCompB`, `parsedTransactionsB`, `userDemographicsB`, `anchorZipB`
- Remove second SSE hook (lines 157-165): `enrichedTransactionsB`, `isProcessingB`, `statusMessageB`, `currentPhaseB`, `startEnrichmentB`, `resetEnrichmentB`
- Remove `handleLoadComparisonSamples` function (lines 398-420)
- Remove `onLoadComparisonSamples` prop from `<UploadOrPasteContainer>` usage (line 1002)
- Simplify `onModeChange` callback (lines 971-983): remove comparison reset block
- Simplify `onLoadSample` callback (lines 984-1001): remove comparison reset block
- **Tab triggers** (lines 952-966): remove all `comparisonMode ?` ternaries, use simple labels ("Preview", "Enrichment", "Dashboard", "Insight Tools") and simple disabled checks without `comparisonMode`
- **Preview tab** (lines 1011-1045): remove comparison branch, keep only single-user `PreviewTable` + `EnrichActionBar`
- **Results tab** (lines 1047-1128): remove comparison branch (dual progress cards), keep only single-user `ResultsTable` + `ExportControls`
- **Analytics tab** (lines 1130-1211): remove comparison branch (`ComparisonDashboard`), keep only single-user view
- **Insights tab** (lines 1213-1230): remove comparison branch (`ComparisonRewardsView`), keep only single-user view

### What stays untouched
- All single-user enrichment, preview, results, analytics, and insights logic
- `/demo` page — no changes
- `ComparisonDashboard.tsx`, `ComparisonRewardsView.tsx`, `ComparisonSetup.tsx` files remain (just unused)

