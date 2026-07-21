## Goal
The X button in the top-right of the `/bankdemo` Demo tab currently links to `/`. Change it so it wipes the demo state and reopens the customer selection dialog to start over.

## Change (single file: `src/pages/ExecDemoPage.tsx`)

1. Add a `resetDemo()` callback that clears all demo-run state and reopens the selection dialog:
   - `setPhase("idle")`
   - `setProcessedIndices([])`, `setRevealedTabs([])`, `setActiveTab(null)`
   - `setPersonaSynthesis(null)`, `setDetectedLifeEvents(null)`, `setEnrichedTxs(null)`
   - `setGeneratedOffers(null)`, `setProductCards(null)`, `setProductActions(null)`
   - `setRiskFlags(null)`, `setCreditAssessment(null)`
   - `setSynthesisTriggered(false)`, `setActivePillFilter(null)`, `setActiveRollup(null)`, `setActiveTriggerPill(null)`
   - `setCollectedIndices([])`, `setStepIndex(0)`
   - reset any loading flags (`offersLoading`, `productsLoading`, `productCardsLoading`, `actionsLoading`, `riskLoading`, `creditLoading`) to false
   - finally `setSelectionDialogOpen(true)`

2. Replace the `<Link to="/">` at line 1472 with a `<button onClick={resetDemo}>` using the same styling and `X` icon. Add `title="Restart demo"` / `aria-label="Restart demo"`.

3. Leave all other behavior (Next Step button, embedded mode, pre-fire logic) untouched.

## Not changing
- Selection dialog contents, background pre-fire pipeline, or navigation elsewhere in the app.
