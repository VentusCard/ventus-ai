## Add a 4th section: **Financial Signals** (loans, mortgages, leases, investments)

Right now the Intel panel has three sections: **Spending Habits** (pillar rollups), **Life Events**, and **Risk**. Large financial products (auto loans, mortgages, leases, brokerage/robo/401k inflows, HELOC draws, student loans, insurance premiums) don't fit any of them — so the LLM misfiles them as "Autoloan Management" spending habits. A dedicated **Financial Signals** section owns this class of transaction.

### Concept

A "financial signal" = recurring or notable interaction with a bigger-than-spending financial product. Each signal names the product family, cadence, servicer, and monthly outflow/inflow.

Canonical financial signal vocab (fixed list):
- `auto_loan` — Auto Loan (servicer + monthly payment)
- `auto_lease` — Auto Lease
- `mortgage` — Mortgage (servicer + monthly payment)
- `heloc` — HELOC draws / payments
- `student_loan` — Student Loan
- `personal_loan` — Personal / Installment Loan
- `credit_card_payoff` — Recurring card-issuer payments to an outside card
- `brokerage_contribution` — Brokerage / robo transfers out (Fidelity, Schwab, Vanguard, Robinhood, Wealthfront, Betterment)
- `retirement_contribution` — 401k / IRA / SEP contributions
- `insurance_premium` — Life / disability / umbrella premiums (not auto/home insurance which is spending)
- `education_savings` — 529 contributions

Each signal in the UI: label, product family, monthly amount range (vaguely specific — "~$450/mo"), servicer/counterparty, `transaction_indices` for the underlying rows.

### Changes

**1. New file `src/lib/financialSignalTaxonomy.ts`**
- Export `FINANCIAL_SIGNAL_VOCAB` (the 11 types above with human labels and merchant-pattern hints used by the LLM).
- Export `FinancialSignal` TS type: `{ id, product_family, label, servicer, monthly_amount_band, cadence, transaction_indices[], talking_points[] }`.

**2. `supabase/functions/synthesize-persona/index.ts`**
- Add a THIRD output alongside `detected_life_events` and `pillar_rollups`: **`financial_signals`**.
- New system-prompt section "FINANCIAL SIGNALS (do this BEFORE rollups, AFTER life events)": scan transactions for the 11 canonical financial-product families; emit one signal per detected product. Use vaguely-specific bands ("~$450/mo", "~$2.1k/mo"), never exact figures.
- Update the vocabulary ban: transactions promoted into a financial_signal MUST NOT also appear in any `pillar_rollup`. Add the explicit ban: no rollup label may contain "Loan", "Mortgage", "Autoloan", "Debt", "Repayment", "Servicing", "Payoff", "Refinance". Add the failure example: `"Autoloan Management" covering VW Credit + Zillow mortgage → these belong in financial_signals as auto_loan + mortgage, NOT a lifestyle rollup.`
- Tool schema: add `financial_signals: array` next to the existing outputs.

**3. `src/components/exec-demo/ExecDemoIntelPanel.tsx`**
- Add a new pill section "Financial Signals" (slate-blue accent, distinct from Spending Habits amber, Life Events amber-gold, Risk red).
- Render each signal as a chip: `<icon> <label> · ~$XXX/mo`. Click behavior mirrors rollup pills — highlights matching `transaction_indices` in the enrichment table.
- Section order top-to-bottom: Life Events → Financial Signals → Spending Habits → Risk.

**4. `src/components/exec-demo/execDemoData.ts` (or wherever `PersonaSynthesis` is typed)**
- Add `financialSignals?: FinancialSignal[]` to the persona synthesis type; thread it from the edge-function response through `ExecDemoPage` into `ExecDemoIntelPanel` props.

**5. External signal wiring (unchanged from before)**
- The existing "Car Loan Renewal in ~2 Months" external bureau signal stays in the Life Events row (it's a forward-looking event, not a current product). If the customer already has an `auto_loan` financial signal detected, the two coexist — bureau = future, financial signal = current — which naturally tells the "renewal is confirmed by their existing VW Credit payments" story without any cross-highlight logic.

### Out of scope

- No changes to the Risk panel logic or the external signal table view.
- No new edge function — reuse `synthesize-persona` and extend its output.
- No changes to product/offer generation; downstream code that reads life_events and rollups is unchanged. Financial signals become additional context downstream can opt into later.

### Result

Auto-loan payments, mortgage payments, brokerage transfers, and insurance premiums surface in their own **Financial Signals** section instead of being force-fit into a "spending habit" rollup. The LLM has an explicit home for these transactions and an explicit ban on repackaging them as lifestyle.
