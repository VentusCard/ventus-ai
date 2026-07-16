## Goal

On `/bankdemo` load, start the Demo pipeline in the background using the default customer so that by the time the user clicks the **Demo** tab, enrichment, persona, life events, offers, and product cards are already populated. The selection dialog still opens on tab click (so users can swap customers or re-run), but if the pre-fire has finished, its results are already visible behind it. Switching to another tab and returning to Demo preserves all state.

## Changes

**1. Keep `ExecDemoPage` mounted across tab switches** (`src/components/tepilot/insights/AnalyticsContainer.tsx`)

Today `renderContent()` conditionally renders `<ExecDemoPage />` only when `activeTab === 'exec-demo'`, so unmounting on tab change wipes all pipeline results. Fix by mounting `ExecDemoPage` once at the container level and toggling its visibility with CSS (`hidden` class) instead of unmounting. All other tab views continue to mount on demand.

**2. Pre-fire pipeline on `/bankdemo` mount** (`src/pages/ExecDemoPage.tsx`)

- Add a new effect that runs once on mount when `embedded === true`: pick the first sample customer (same default the selection dialog offers), set it as `demoCustomer`, and call the same handler the dialog uses when the user clicks "Run" — `fireClassification(csv)` plus the downstream chain (persona synthesis, life events, offers, product cards) that already auto-triggers off classification completion.
- Guard with a `useRef` so it only fires once per mount, and skip if `customCsv` is already set (user pasted their own).
- Do **not** auto-dismiss `selectionDialogOpen` — per the earlier requirement, the dialog still opens on Demo tab click. The pre-fire simply means results are ready behind it.

**3. Preserve session results**

Because the component now stays mounted (step 1), all React state (`enrichedTxs`, `personaSynthesis`, `productCards`, `generatedOffers`, `detectedLifeEvents`, etc.) persists automatically when the user switches tabs and returns. No additional storage layer needed.

## Technical notes

- The Demo tab's `-m-4 h-[calc(100%+2rem)] w-[calc(100%+2rem)]` wrapper moves into the persistent mount and uses `hidden` when inactive to keep layout identical.
- The pre-fire guard checks `!profile && !phase !== 'idle' && embedded` to avoid re-running if the user has already interacted.
- No edge function or backend changes.
- No changes to the standalone `/demo` route (uses `DemoPage`, not `ExecDemoPage`).