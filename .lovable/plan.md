## /pricing — Internal Sales Pricing Builder

A password-gated (`ventus2026`) interactive pricing page used in client conversations. Sales rep enters bank info, toggles Ventus modules à la carte, the page computes a hybrid cost (fixed platform fee + per-user/year), and emails a draft proposal to the prospect via the existing email function.

---

### 1. Route + Gate

- Add `/pricing` route in `src/App.tsx` (treat it like `/demo` — no Navbar/Footer chrome) pointing to a new `src/pages/Pricing.tsx`.
- Wrap the page in the existing `SimplePasswordGate` (`src/components/demo/SimplePasswordGate.tsx`) — same `ventus2026` password and shared `sessionStorage` access used for `/deckmo`. No new gate component needed.

---

### 2. Page Layout (`src/pages/Pricing.tsx`)

Single-screen, light-theme, Manrope, white bg / slate-200 borders (per project core memory). Three regions:

**Top bar**
- Left: Ventus wordmark + "Pricing Builder" label.
- Right: Admin gear icon (opens fee editor dialog).

**Left column — Inputs (≈40% width)**
- "Bank name" text input
- "Number of customers" numeric input (with thousands formatting)
- "Prospect contact name" + "Prospect email" (used for the draft email)
- Optional: "Notes for proposal" textarea

**Center column — Module à la carte grid (≈60%)**
Each module is a clickable card (toggle selected/unselected with a check + ring). Cards show: module name, 1-line value prop, fixed fee, per-user/year fee, and computed line total for the entered customer count.

Default module catalog (editable via admin panel):

| Module | Default fixed fee | Default per-user/yr |
|---|---|---|
| Transaction Enrichment Engine | $250,000 | $0.40 |
| Smart Rewards / Deal Personalization | $150,000 | $0.30 |
| Wealth Copilot (Advisor Console) | $200,000 | $1.20 |
| Travel Experience | $100,000 | $0.20 |
| Bank-Wide Analytics | $180,000 | $0.25 |
| Life Event Detection | $120,000 | $0.35 |
| Risk / FVI Intelligence | $160,000 | $0.30 |
| Conversational AI (Consumer + Banker) | $140,000 | $0.50 |

(These are placeholders — sales can override per-deal in the admin panel.)

**Right strip / sticky footer — Total summary**
- Sum of fixed fees of selected modules
- Sum of (per-user fee × customers) of selected modules
- Grand total / year (large)
- Effective $/customer/year (small)
- Buttons: "Copy summary", "Email draft to prospect"

---

### 3. Calculations

For each selected module:
- `lineTotal = fixedFee + perUserFee * numCustomers`

Totals:
- `totalFixed = Σ fixedFee(selected)`
- `totalVariable = Σ perUserFee(selected) * numCustomers`
- `grandTotal = totalFixed + totalVariable`
- `perCustomer = grandTotal / numCustomers` (guard div/0)

All currency formatted via existing `src/lib/formatHelper.ts` (`formatCurrency`, `formatNumber`).

---

### 4. Admin Fee Editor

- Gear icon in top-right opens a `Dialog` with a table: Module | Fixed Fee | Per-User/Yr | Enabled.
- Inline editable inputs; "Save" persists to `localStorage` under key `ventus_pricing_catalog_v1`.
- "Reset to defaults" button restores baked-in defaults.
- No additional auth — page is already password-gated.

Catalog state lives in a small hook (`usePricingCatalog`) that hydrates from `localStorage` on mount and writes back on save. Default catalog is a constant exported from `src/lib/pricingCatalog.ts`.

---

### 5. Email Draft Sending

Reuse the existing `send-follow-up-email` edge function (already deployed, uses `RESEND_API_KEY`, sends from `marco@ventusai.com`). No new edge function or secret required.

Flow on "Email draft to prospect":
1. Validate prospect email + at least 1 module selected.
2. Build a plain-text proposal body:
   - Greeting with prospect name + bank name
   - Short intro paragraph
   - Itemized list: each selected module with fixed + per-user line + line total
   - Totals block (fixed, variable, grand total, $/customer/yr)
   - Sign-off
3. Show a preview `Dialog` with editable subject + body (Textarea) before send (so sales can tweak).
4. On confirm, call:
   ```ts
   supabase.functions.invoke('send-follow-up-email', {
     body: { to, subject, body, advisorName: 'Ventus AI Team' }
   })
   ```
5. Toast success/failure via `sonner`.

No attachments in v1 (edge function supports them but not needed yet).

---

### 6. Files to create / edit

**Create**
- `src/pages/Pricing.tsx` — main page (gated wrapper + layout)
- `src/components/pricing/ModuleCard.tsx` — toggleable module card
- `src/components/pricing/PricingSummary.tsx` — totals + actions
- `src/components/pricing/AdminFeeEditorDialog.tsx` — gear-icon dialog
- `src/components/pricing/EmailDraftDialog.tsx` — preview + send dialog
- `src/lib/pricingCatalog.ts` — default catalog + types + localStorage hook

**Edit**
- `src/App.tsx` — add `/pricing` route; add `/pricing` to the `isDemo`-style chrome-hiding check so Navbar/Footer don't render.

**No backend changes** — reuses existing `send-follow-up-email` function.

---

### 7. Out of scope (v1)

- No persistence of proposals across users/devices (admin overrides are per-browser via localStorage).
- No PDF export (can add later via existing pdf export helpers).
- No multi-currency, no discount tiers, no contract length selector — keep simple, can iterate after first client demo.
