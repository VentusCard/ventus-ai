## Goal

When `ExecDemoPage` is embedded inside `/bankdemo` (Demo tab), still show the existing selection dialog, but lock it to a single customer (no other users selectable, no custom-customer flow) AND pre-fire the full LLM analysis pipeline immediately on mount. The standalone `/demo` route is unchanged and keeps the full multi-customer picker.

## Changes

### 1. `src/pages/ExecDemoPage.tsx`
- Add optional `embedded?: boolean` prop.
- Pass `embedded` down to `<ExecDemoSelectionDialog>` and to `<ExecDemoLeftPanel>` (so the "Change customer" button can be hidden in embed mode).
- On mount, the page already calls `fireClassification(getCsvForCustomer(0))`. When `embedded` is true, also kick off `handleRunAnalysis()` once on mount (via the existing `runAnalysisRef` to avoid TDZ), so persona / offers / products / actions / credit LLMs all start as soon as the Demo tab opens.
- In embed mode, also pre-warm the dialog's "selected customer" to index 0 (which is already the default).

### 2. `src/components/exec-demo/ExecDemoSelectionDialog.tsx`
- Add optional `embedded?: boolean` prop.
- When `embedded` is true:
  - Render only `DEMO_CUSTOMERS[0]` in the left customer list (hide the other entries) and remove the "+ Custom customer" / `showCustomFlow` affordance.
  - Hide the per-row click affordances that switch customers (or render them disabled) so the user cannot pick a different one.
  - Keep everything else (raw transaction table preview, "Run analysis" CTA, dialog chrome) intact so the dialog still looks and behaves the same.

### 3. `src/components/tepilot/insights/AnalyticsContainer.tsx` (line ~161)
- Render `<ExecDemoPage embedded />` when shown inside the bankdemo Demo tab.

### 4. `src/components/exec-demo/ExecDemoLeftPanel.tsx` (only if needed)
- If the "Change customer" button is unconditionally rendered, hide it when `embedded` is true (or when `onChangeCustomer` is undefined).

## Notes

- Single user shown = `DEMO_CUSTOMERS[0]` (matches the currently pre-fired classification on mount).
- Pre-firing happens once, guarded by a ref so React StrictMode double-mount doesn't double-invoke the LLM pipeline.
- Frontend/presentation only — no edge function, data, or routing changes outside the props above.
