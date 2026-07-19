## What's broken

Only one Financial Signal pill shows: `Auto Loan · VW Credit ~$685/mo`. That's the LLM's synthesis from transactions — the fixture external signal `Auto Loan · Renewal in ~2mo` (Toyota Financial, `product_family: "auto_loan"`) never renders as its own pill or with any visual marker.

Root causes (confirmed by reading code):

1. **De-dupe kills the external pill.** `src/pages/ExecDemoPage.tsx` lines 621–644 append external financial signals only if no LLM-emitted financial signal shares `product_family`. The LLM already emitted an `auto_loan`, so the external one is silently dropped.
2. **No visual "external" marker on pills.** Financial Signal pills in `ExecDemoIntelPanel.tsx` render label + monthly band only — nothing indicates `source: "external"` or provider (Bureau Tradeline). The external row in the enrichment table only appears after a pill click; nothing tells the viewer an external signal exists.
3. **Fixture drift.** The seeded external signal uses "Toyota Financial Services / ~$485/mo", but the demo customer's transactions show VW Credit / ~$685/mo, making it obvious the LLM version won and the external version was suppressed.

## Fix

### 1. External wins over LLM for the same product family
In `src/pages/ExecDemoPage.tsx` (external-signal injection block, ~line 617):
- Instead of "skip if LLM already emitted", **replace** the LLM-emitted financial signal whose `product_family` matches an external signal.
- Preserve useful fields the LLM inferred from real transactions (servicer, monthly_amount_band, transaction_indices) by merging them **onto** the external record — external signal stays the source of truth for id/label/provider/confidence and keeps `source: "external"`.
- Do the same for `demographic_shift` externals if they collide with an LLM demographic entry.

### 2. Make the external pill visually distinct
In `src/components/exec-demo/ExecDemoIntelPanel.tsx` Financial Signal pill renderer:
- When `signal.source === "external"`, render a compact prefix — a small satellite/broadcast glyph plus a subdued "Ext" tag — inside the pill, and a violet accent border to match the enrichment-table external callout.
- Add a tooltip showing `provider` + `detail` (e.g. "Bureau Tradeline · Toyota Financial Services · maturity in ~60 days").
- Apply the same treatment to Demographic pills sourced externally.

### 3. Align fixture with the visible transactions
In `src/lib/externalIntelligenceSignals.ts`:
- Update the `auto-loan-renewal` fixture to `servicer: "VW Credit"`, `monthly_amount_band: "~$685/mo"`, evidence merchant `"VW CREDIT INC"` — so the injected external pill reads consistently with the enrichment table rows the user sees.

### 4. Broaden pill→external match (already partially there)
In `ExecDemoIntelPanel.tsx` `activeExternalSignalId` memo:
- Also match when the pill's underlying financial signal object carries `source === "external"` directly (no string sniffing needed).
- Keep the existing product-family / servicer substring match as a fallback for LLM-derived pills that describe the same product.

### 5. Verification
- Rerun the Demo tab, confirm one Financial Signal pill labeled `Auto Loan · VW Credit ~$685/mo` renders with the external marker + tooltip.
- Click the pill → the violet External Intelligence row still appears at the top of the enrichment table alongside the VW Credit transactions.
- Confirm no duplicate `auto_loan` pill and no regressions to Demographic / Life Event rows.

## Out of scope
- Adding new external signal categories (property, employment) — the fixture stays a single auto-loan signal for now.
- Changes to `synthesize-persona` edge function; ownership stays deterministic on the frontend injection step.
