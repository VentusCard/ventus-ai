## Use customized bank name everywhere in Next-Product

The Next-Product card sometimes shows "Our Bank 529 College Savings Plan" because several places still hardcode "Our Bank" instead of using the bank name from the demo password gate.

### Changes

**1. `supabase/functions/generate-product-cards/index.ts`** — RISK CARD examples (lines 98–102) still say `"Our Bank …"`. Replace each with `"${bankLabel} …"` so the LLM uses the customized bank name (or "Our Bank" only when generic mode is selected):
- `${bankLabel} SafeBalance Account Controls`
- `${bankLabel} Account Wellness Tools`
- `${bankLabel} Spending Limits & Merchant Controls`
- `${bankLabel} Confidential Customer Care`
- All hardship product examples: `${bankLabel} Hardship Assistance Program`, `${bankLabel} Overdraft Protection & Fee Waivers`, `${bankLabel} Confidential Financial Coaching`, `${bankLabel} Balance Assist Short-Term Loan`, `${bankLabel} Customized Cash Wellness Plan`.

Also reinforce the rule at the top of the system prompt: add an explicit line — "Every product_name MUST be prefixed with `${bankLabel}`. Never emit a product_name containing the literal phrase 'Our Bank' unless `${bankLabel}` is exactly 'Our Bank'." — so the model stops echoing the placeholder.

**2. `src/components/exec-demo/ExecDemoPhoneView.tsx`** (line 157) — Phone status bar header reads `Our Bank · ${firstName}`. Read the customized bank name via `getBankPromptContext()` (or `getDemoBankConfig()`) from `@/lib/demoBankConfig` and use `bankShortName || bankName || "Our Bank"` in place of the literal "Our Bank".

**3. `src/components/demo/DemoDetailOverlay.tsx`** (line 229) — Static "Our Bank" label in the demo overlay header. Same swap: read from `demoBankConfig` and fall back to "Our Bank".

### Out of scope

- `src/components/tepilot/insights/AnalyticsContainer.tsx` is the TePilot analytics shell (separate flow) — leave untouched unless requested.
- `src/pages/solutions/NextProductPage.tsx` and `src/lib/campaignData.ts` are public marketing pages, not the executive demo — not changed.
