## Add Demographic Shifts as the 5th Intel Row

Replace the earlier "static demographics" idea with **Demographic Shifts** — inferred change events derived from transaction patterns. Static baseline (age, income band, household) collapses to a small header chip; the row surfaces only *what has changed or is changing*.

### Detection taxonomy (extended into `synthesize-persona`)

The LLM will emit a new `demographic_shifts` block. Each shift has: `id`, `label`, `category`, `direction` (`up` | `down` | `lateral`), `confidence` (0–1), `evidence_summary`, `transaction_indices[]`, and an optional `magnitude_band` (e.g. `+18% payroll`, `ZIP 94301 → 10013`).

Categories the model looks for:
- **Income trajectory** — payroll ACH amount step (±), payroll counterparty flip (job change), unemployment credit, 1099/Stripe/Square deposits appearing (self-employment), SSA/pension credits (retirement onset)
- **Wealth-tier migration** — sustained brokerage/401k contribution increases, large one-time inflow (liquidity event), reserve buffer expansion → Mass → Affluent → HNW
- **Household composition** — new baby (diaper/formula/pediatric), kid → college (tuition ACH, out-of-state debit cluster), empty nest (tuition stops + travel rise), divorce (legal + duplicate utilities), new pet (vet/Chewy recurring)
- **Geography / relocation** — merchant ZIP centroid drift ≥30 days, moving-company/U-Haul charge, new utility setup, commute pattern flip
- **Life-stage entry** — homeownership (title/escrow → new mortgage ACH), marriage (joint account, wedding vendors), eldercare onset (assisted-living, in-home care agency), health event (hospital + specialty pharmacy + PT recurring)

### Edge function changes — `supabase/functions/synthesize-persona/index.ts`

1. Build a **`demographicCandidateBlock`** alongside the existing `financialTxnBlock`:
   - Payroll ACH transactions (recurring credits with employer-like descriptions), grouped chronologically so the LLM can see amount/counterparty steps.
   - Merchant ZIP series (transactions with location metadata) to expose centroid drift.
   - Family/household hint transactions (childcare, tuition, pediatric, eldercare, vet, moving, title/escrow, wedding-vendor keywords).
2. Extend the system prompt with a **DEMOGRAPHIC SHIFTS** section instructing the model to:
   - Emit only *changes* (never restate static age/ZIP).
   - Require ≥2 supporting transactions per shift, cite `[T<idx>]`.
   - Prefer high-value shifts (income, wealth-tier, relocation, household) over low-value ones; cap at 4 shifts.
   - Do NOT reuse transactions already claimed by `financial_signals` unless the shift is a distinct interpretation (allowed with a note).
3. Add `demographic_shifts` to the response schema and TS types.

### UI changes — `src/components/exec-demo/ExecDemoIntelPanel.tsx`

- Add `DemographicShift` interface + `demographicShifts?: DemographicShift[]` on `PersonaSynthesis`.
- Render a new 5th row **below Risk Factors** matching the existing row rhythm (`labelWidth`, `labelTextSize`, `rowGap`, `pillRowClass`):
  - Label: `Demographic Shifts:` in a distinct **teal/emerald** tone (unused by other rows), with Info tooltip explaining "Inferred changes to the customer's life stage, household, income, wealth tier, or geography — detected from transaction patterns before the customer self-reports."
  - Pills styled like life-event pills but teal; each pill shows a directional glyph (`↑` / `↓` / `→`), the label, and optional `magnitude_band` as muted trailing text.
  - Clicking a pill calls `onTriggerPillClick(label, transaction_indices, "#0d9488", "lifeEvent")` so the enrichment table filters to the supporting transactions (same interaction as life events).
  - Hide the row when `demographicShifts` is empty.
- Guard: if a shift has zero `transaction_indices`, still render but non-clickable (rare edge case).

### Downstream propagation

- `ExecDemoPage.tsx` already forwards the full `personaSynthesis` to Next-Product and Next-Offer generation calls — no plumbing change needed; the new field flows automatically.
- Optionally include `demographic_shifts` in the prompts for `generate-product-cards` and `generate-next-offer` so a detected "wealth-tier migration ↑" can drive a WM product recommendation. Small addition to those prompts; no schema change.

### Not changing

- Enrichment table styling / external-signal view.
- Financial Signals row and its taxonomy.
- Risk Factors detection.
- No new taxonomy file needed — detection lives in the edge function prompt, consistent with how life events and financial signals are handled.
