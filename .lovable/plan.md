
# Make the persona LLM external-signal-aware from the start

Today external intelligence signals (e.g. "Car Loan Renewal in ~2 Months") are grafted onto the intel panel **after** `synthesize-persona` returns. The LLM never sees them, so it can't reconcile them against life events / financial signals / demographic shifts, and the UI ends up with miscategorized pills (car loan under Life Events, college prep under Life Events instead of Demographic Shift).

Fix: pipe external signals into the LLM as first-class input, and re-teach the taxonomy so the model owns bucket assignment holistically.

## 1. Pass external signals into the edge function

**`src/pages/ExecDemoPage.tsx`**
- Resolve the sample's external signals *before* invoking `synthesize-persona`.
- Add `external_signals` to the function payload: `[{ id, source, provider, type ("financial"|"life_event"|"behavioral"|"demographic"), label, detail, confidence, evidence_hint }]`.
- Stop post-hoc injecting external signals into `detectedLifeEvents`. The LLM's response is now the source of truth; keep only the belt-and-suspenders exclusivity guard.

**`src/lib/externalIntelligenceSignals.ts`**
- Add a `bucket` field to each signal: `"financial_signal" | "life_event" | "demographic_shift" | "behavioral"`.
- Retag `car_loan_renewal` → `financial_signal` with `product: "Auto Loan"` and `signal_kind: "renewal_window"`.
- Future-proof: shape is generic so new external providers just add rows.

## 2. Teach the LLM the new rules

**`supabase/functions/synthesize-persona/index.ts`**
- Extend the request schema to accept `external_signals: ExternalSignal[]` and render them into the prompt inside a dedicated `## EXTERNAL SIGNALS (pre-classified)` block, one line per signal, showing source, bucket hint, label, and confidence.
- Update the **EVIDENCE OWNERSHIP LADDER** to explicitly cover external signals: they enter the ladder at the bucket their `bucket` field declares, and must appear in the corresponding output array with `source: "external"` and the provider name preserved.
- Rewrite two taxonomy rules that produced the reported miscategorizations:
  - **Auto/Car loans, mortgages, student loans, leases, brokerage/401k, insurance premiums → Financial Signals only.** Never a life event, even if the trigger is an external "renewal in ~N months" alert. Life-event vocabulary ("Car Loan Renewal") is banned as a life-event label.
  - **College Preparation for Dependent → Demographic Shift (`household_composition` = "kid → college").** Remove it from the Life Event enumeration and examples. Evidence patterns (SAT/ACT/College Board, campus tours, dorm supplies, tuition deposits, 529 draw-downs) are claimed by the demographic shift.
- Add an "External signal reconciliation" clause: if an external signal's bucket conflicts with what the transactions alone would suggest, the external signal wins for bucket assignment but the model must still surface the transaction evidence it relied on.
- Extend the tool schema so every output item (life event, financial signal, demographic shift, pillar rollup) can carry optional `source: "transactions" | "external" | "hybrid"` and `external_signal_ids: string[]`.

## 3. UI plumbing

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**
- Render pills with the violet "external" accent whenever `source !== "transactions"`, in whichever row the LLM placed them (Life Events, Financial Signals, Demographic Shifts, Spending Habits).
- Use the LLM-provided `signal_count` label ("1 signal" for pure-external, "N txns" otherwise) instead of the current hard-coded branch.

**`src/components/exec-demo/ExecDemoEnrichmentTable.tsx`**
- Trigger the existing "External Signal" table view whenever the clicked pill has `source: "external"` (or `"hybrid"` with no txn evidence), regardless of which row it sits in — the current life-event-only trigger is removed.

## 4. Guard rails (belt & suspenders)

**`src/pages/ExecDemoPage.tsx`** post-processing (kept, tightened):
- Enforce the ladder in code: strip any demographic shift whose `transaction_indices` are fully claimed by a life event or financial signal. No change needed for external-only entries (they carry no txn indices).
- Drop any life event whose canonical label matches the banned list (car loan renewal, college prep, mortgage refi, etc.) as a safety net if the model regresses.

## Out of scope

- No changes to Risk Factors, Spending Habits pillar logic beyond source-flag rendering.
- No changes to `generate-product-cards`; the new bucket assignment already flows into its input.
- No new external providers wired up — just the schema to accept them.
