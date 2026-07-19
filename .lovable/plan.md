## Goal

Clicking the **Auto Loan · Renewal in ~2mo** pill (and any other pill that matches an external-intelligence signal) should surface the violet **External Signal** row *alongside* the customer's related transactions — not swap them out. Today the table hides all transactions and shows only the external row, which loses the tie-back to the customer's own auto-loan payments.

## Current behavior (verified)

- `ExecDemoIntelPanel.tsx` computes `activeExternalSignalId` by matching `activeTriggerLabel === externalSignal.event_name`. It fires only for life-event pills whose label matches verbatim — the Financial Signal auto-loan pill uses the LLM's `fs.label` (e.g. "Auto Loan · VW Credit"), so today it never activates the external row.
- `ExecDemoEnrichmentTable.tsx` treats `activeExternal` as a full **takeover**: when set, it hides `<tbody>` transaction rows entirely and renders a single 5-column violet header + one row. That is why the user never sees the underlying transactions together with the external signal.

## Changes

### 1. Match Financial Signal pills to external signals (`ExecDemoIntelPanel.tsx`)

Broaden `activeExternalSignalId` resolution so Financial Signal pills (not just life-event labels) can activate an external row:

- Match by `event_name` (existing behavior).
- Also match by `product_family` (e.g. `auto_loan`) or `servicer` substring against the pill's `label` — so `fs.label = "Auto Loan · VW Credit"` still resolves to the `auto-loan-renewal` external signal.

### 2. Stop hiding transactions when an external signal is active (`ExecDemoEnrichmentTable.tsx`)

Replace the "takeover" behavior with an **inline callout + full table**:

- Keep the standard 10-column `colgroup`/`thead` (Raw + Semantic Enrichment) at all times.
- When `activeExternal` is set, insert a single violet callout row as the **first `<tr>` of the `<tbody>`** spanning all 10 columns. Reuse the existing violet styling (icon, provider chip, confidence, "sourced from outside data provider" tag) already built for the takeover view.
- Continue to render the transaction rows below, using `highlightedIndices` (the pill's `transaction_indices`) to highlight matching auto-loan payments and dim the rest — same logic already used for every other pill.
- Update the top strip copy so it reads e.g. *"Showing 1 external signal + N matching transactions for 'Auto Loan · VW Credit'"*.
- Delete the now-unused Tier-1/Tier-2 takeover branches (`activeExternal ? ... : ...`) that swapped the header and `colgroup`.

### 3. No other files change

The `activeTriggerPill` state, `filteredIndices` derivation, and `externalSignals` prop plumbing already flow both signals through — we're only changing how the enrichment table renders them.

## Out of scope

- Life-event and demographic pills already work correctly; no changes to their click handlers beyond the shared external-signal matcher.
- No LLM prompt or edge-function changes.
