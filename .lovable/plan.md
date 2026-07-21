## Goal

On the **Next-Product** tab of `/bankdemo`, the 3rd generated card is currently coming out as a gambling/risk card ("Additional Tools → Account Wellness"). Since we now surface **Financial Signals** (e.g., "Auto Loan · VW Credit ~$685/mo"), the 3rd card should be a **financial-signal-driven product** — an auto refi offer when we have an auto loan signal, a mortgage refi when we have a mortgage signal, etc. The 3rd behavioral card only appears when no financial signal exists.

## Changes

### 1. `supabase/functions/generate-product-cards/index.ts`
- Accept a new input field `financial_signals` (array of `{ label, product_family, servicer, monthly_payment, balance, rate, term_months, renewal_window, transaction_indices }`).
- Update card slot 3 priority ladder:
  1. If `financial_signals[0]` exists → emit a **`financial_signal`** card grounded in that signal.
  2. Else → emit the existing behavioral card from `persona_rollups[0]`.
- Add `"financial_signal"` to the `type` enum in the tool schema.
- For a `financial_signal` card:
  - `signal_label` MUST equal `financial_signals[0].label` verbatim (for pill matching / grey-out logic).
  - Product must map to the financial family:
    - Auto Loan → `{bank} Auto Loan Refinance`
    - Mortgage → `{bank} Mortgage Refinance` or `{bank} HELOC`
    - Student Loan → `{bank} Student Loan Refinance`
    - Investment → `{bank} Guided Investing` / IRA rollover
    - Lease → `{bank} Auto Loan` (buyout financing)
  - `offer_headline`, `benefits`, and `quote` must use the signal's numbers (monthly payment, balance, renewal window) to compute a concrete estimated savings.
  - Example (VW Credit, $685/mo, renewal in ~2mo): `"Refinancing at ~5.49% APR could save you an estimated $180/mo — roughly $2,160/year."`
- **Explicitly forbid risk/vice/gambling themes** and any "Account Wellness / Account Controls / Set Up Account Controls" copy in the system prompt. Add `risk_flags` note: risk data is context only, never a product card.

### 2. `src/pages/ExecDemoPage.tsx`
- In `firePreloadProductCards`, pass `financial_signals: synthesis?.financialSignals || []` to the edge function body.

### 3. `src/components/exec-demo/NextProductRationale.tsx`
- Extend the card-type handling so `type === "financial_signal"` resolves correctly:
  - Color theme: reuse "Financial Planning" / neutral slate.
  - Pill-matching function tries `financialSignals` first for these cards (match by `label` or `product_family`), analogous to the existing life-event and behavioral resolvers.
- Add a lightweight `deriveOfferDetails` branch for auto refi / mortgage refi so fallbacks are sensible if the LLM omits a field.

### 4. `src/components/exec-demo/ExecDemoIntelPanel.tsx` (light touch)
- On the Next-Product tab, financial pills are currently rendered normally (only greyed on Next-Offer). No change needed; matching card now lives in the 3rd slot so the associated pill will highlight when the user clicks the auto loan pill.

## Out of scope
- No changes to the Next-Offer greying logic, no changes to `synthesize-persona`, no changes to external-signal ingestion (the auto loan signal already flows into `synthesis.financialSignals` via the external-intelligence merge).

## Technical notes
- Card slot 3's `type` value change (`"behavioral"` → `"financial_signal"`) is backward-compatible: `NextProductRationale.tsx` currently branches on `type === "behavioral"` only for evidence matching; the new branch keeps behavior parity when no financial signal is present.
- The LLM prompt keeps the strict 3-card cap and CARD ORDER (life_event_1, life_event_2, financial_or_behavioral) so the phone-mockup layout doesn't shift.
