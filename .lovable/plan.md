## Goal
Add a gear icon on the `/demo` password gate that opens a passcode-protected bank customization panel. The bank choice persists across sessions (localStorage) and is threaded into downstream edge functions so generated copy references that bank. Includes a "Generic (no customization)" option.

## UX — `src/components/demo/SimplePasswordGate.tsx`

- Add `Settings` (gear) icon button in the top-right corner of the gate screen.
- Clicking opens a small dialog:
  - Step 1: passcode prompt (same `ventus2026` as the demo gate). Validates locally; on success advances to step 2. No session persistence — re-prompts every time the dialog opens.
  - Step 2: bank customization form
    - Radio / toggle: **Generic (no customization)** vs **Custom bank**
    - When "Custom bank" selected: text input "Bank name" (e.g. "First National Bank"), optional "Shorthand" (e.g. "FNB")
    - Save / Cancel buttons
- Persist to **`localStorage`** key `demo_bank_config` as `{ mode: "generic" | "custom", bankName?, bankShortName? }`. Never auto-cleared.
- Show small muted label under the logo when set: "Customized for: X" (or nothing for generic).
- Main demo gate logic unchanged (still uses `sessionStorage` for the demo entry).

## Shared accessor — new `src/lib/demoBankConfig.ts`

```ts
export type DemoBankConfig = { mode: "generic" | "custom"; bankName?: string; bankShortName?: string };
export function getDemoBankConfig(): DemoBankConfig;       // defaults to {mode:"generic"}
export function setDemoBankConfig(cfg: DemoBankConfig): void;
```

Helper `getBankPromptContext()` that returns `null` for generic or `{ bankName, bankShortName }` for custom — to spread into edge function bodies.

## Wire bank into edge function calls

Add `bankContext` to every relevant `supabase.functions.invoke(...)` body in the exec demo flow:

- `src/pages/ExecDemoPage.tsx` (lines ~286, 539, 585, 657, 706, 752):
  - `synthesize-persona`, `generate-next-offers`, `analyze-lifestyle-signals`, `detect-risk-transactions` (pass-through), `generate-product-cards`, `generate-product-actions`
  - Skip raw `/classify-transactions` fetch — bank-agnostic
- `src/components/demo/ConsumerAIChatView.tsx` (line ~290): `consumer-chat` — most important for chatbot persona

## Edge function updates

Each function accepts optional `bankContext: { bankName?, bankShortName? }`. When present, inject into the LLM system prompt (e.g. "You are generating copy for {bankName}. Reference the bank by name where natural."). When absent, fall back to current generic copy ("your bank").

Functions touched:
- `supabase/functions/consumer-chat/index.ts` — chatbot persona
- `supabase/functions/generate-product-cards/index.ts` — product titles/issuer references
- `supabase/functions/generate-next-offers/index.ts` — offer issuer language
- `supabase/functions/generate-product-actions/index.ts` — CTA copy
- `supabase/functions/synthesize-persona/index.ts` — pass-through; minor narrative hint
- `supabase/functions/analyze-lifestyle-signals/index.ts` — pass-through

Validation: trim, max 80 chars, ignore if empty/invalid.

## Out of scope
- No DB persistence — single-browser localStorage only.
- No in-demo "change bank" UI — only via gate gear.
- No per-customer overrides.

## Files touched
- `src/components/demo/SimplePasswordGate.tsx`
- `src/lib/demoBankConfig.ts` (new)
- `src/pages/ExecDemoPage.tsx`
- `src/components/demo/ConsumerAIChatView.tsx`
- 6 edge function `index.ts` files listed above
