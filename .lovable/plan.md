Revise the `/bankdemo` Demo tab embed behavior so the selection dialog still appears and the user clicks "Run analysis" to start.

## Changes

1. **`src/pages/ExecDemoPage.tsx`**
   - Keep `selectionDialogOpen` initial state `true` in embedded mode (same as standalone) so the dialog pops up on mount.
   - Remove the auto-fire `runAnalysisRef.current?.()` effect (`embedAutoFiredRef`) added previously. The user must click the "Run analysis" CTA inside the dialog.
   - Keep the existing pre-warm `fireClassification(getCsvForCustomer(0))` on mount so classification is ready by the time they click.
   - Keep `onChangeCustomer={undefined}` so the left panel's "Change" button stays hidden after the dialog closes.

2. **`src/components/exec-demo/ExecDemoSelectionDialog.tsx`** — no change. Still shows only `DEMO_CUSTOMERS[0]` in embedded mode, with no "Custom" affordance and no row re-selection. The "Run analysis" button at the bottom remains active.

3. **`src/components/exec-demo/ExecDemoLeftPanel.tsx`** — no change.

4. **`src/components/tepilot/insights/AnalyticsContainer.tsx`** — no change (still `<ExecDemoPage embedded />`).

Net effect: dialog opens automatically on tab entry with the single locked customer pre-selected; user clicks "Run analysis" to kick off the LLM pipeline.