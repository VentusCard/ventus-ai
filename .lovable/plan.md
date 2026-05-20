
## Goal

Add a **4th column** to the Next-Product tab (`NextProductRationale.tsx`) — after Life Event, Shopping Habit, Additional Tools — that shows the **creditworthiness** result from the `assess-creditworthiness` edge function we just deployed.

Scope is the Exec Demo Next-Product panel only. No CSV, no other tabs.

---

## Where this lives

- View: `src/components/exec-demo/NextProductRationale.tsx` (renders the row of columns).
- Orchestrator: `src/pages/ExecDemoPage.tsx` (already owns `productCards`, `riskFlags`, etc. — add credit fetch + state here).
- Wiring: `src/components/exec-demo/ExecDemoIntelPanel.tsx` (passes props through).

---

## Changes

### 1. `src/pages/ExecDemoPage.tsx`

- New state:
  ```ts
  const [creditAssessment, setCreditAssessment] = useState<CreditAssessment | null>(null);
  const [creditLoading, setCreditLoading] = useState(false);
  ```
- New `fireCreditAssessment` callback, mirroring `fireProductCards` structure. Triggered alongside `fireProductCards` (phase 2, after `classify-transactions` completes — same gate `fireProductCards` already uses).
  ```ts
  const { data, error } = await supabase.functions.invoke("assess-creditworthiness", {
    body: {
      client: {
        name: demoCustomer?.profile?.name,
        age: demographics.age,
        occupation: demographics.occupation,
        industry: demographics.industry,
        income_level: demographics.incomeLevel,
        family_status: demographics.familyStatus,
        segment: demoCustomer?.profile?.segment,
      },
      transactions: classifiedRef.current || [],
      window_days: 90,
    },
  });
  ```
- Reset on customer switch (alongside existing `setProductCards(null)`).
- Pass `creditAssessment` + `creditLoading` into `<ExecDemoIntelPanel ... />` (both call sites, lines ~1365 and ~1454).

### 2. `src/components/exec-demo/ExecDemoIntelPanel.tsx`

- Extend `Props` with `creditAssessment?: CreditAssessment | null; creditLoading?: boolean;`.
- Forward to `<NextProductRationale ... creditAssessment={creditAssessment} creditLoading={creditLoading} />` at line 960.

### 3. `src/components/exec-demo/NextProductRationale.tsx` — the actual 4th column

- Add a shared `CreditAssessment` TypeScript interface (exported) matching the edge-function response:
  ```ts
  export interface CreditAssessment {
    score: number;
    band: "Excellent" | "Good" | "Fair" | "Limited" | "Poor";
    confidence: number;
    summary: string;
    drivers: { label: string; direction: "positive" | "negative" | "neutral"; weight: number; explanation: string }[];
    affordability: { estimated_monthly_inflow: number; estimated_monthly_outflow: number; estimated_dti_proxy: number; surplus_ratio: number };
    signals: {
      income_stability: "stable" | "variable" | "thin" | "unknown";
      cashflow_volatility: "low" | "medium" | "high";
      discretionary_pressure: "low" | "medium" | "high";
      distress_indicators: string[];
      positive_indicators: string[];
    };
    recommended_products: { product: string; rationale: string }[];
    caveats: string[];
  }
  ```
- Extend `Props`: `creditAssessment?: CreditAssessment | null; creditLoading?: boolean;`.
- Render: when present, push a 4th `ResolvedCard`-shaped entry into `pickedCards` and bump the cap from 3 to 4 (`pickedCards.length >= 4`). Reuse `renderColumn`'s outer shell — header label + pill + body — but branch the body and pill to a credit-specific renderer.
- Header label: `"Creditworthiness"`.
- Pill (replaces the standard trigger pill):
  - Text: band name + score, e.g. `"Good · 732"`.
  - Color map by band (light theme, slate-200-border palette already in file):
    - Excellent → emerald (`#10b981`)
    - Good → sky/blue (`#3b82f6`)
    - Fair → amber (`#f59e0b`)
    - Limited → slate (`#64748b`)
    - Poor → rose (`#f43f5e`) — sparingly, this is the only justified red use (memory rule allows red for risk; credit risk qualifies).
  - Suffix: `"{confidence}% conf"` in muted small text.
  - Non-clickable (no triggerable transactions).
- Body card (compact, matches existing `ProductCardBody` density):
  1. One-line `summary`.
  2. Mini-grid: `Monthly inflow / Monthly outflow / Surplus / DTI proxy` formatted with the existing `formatSpend` and percentage helpers.
  3. **Signal chips row** (small pills): `income_stability`, `cashflow_volatility`, `discretionary_pressure` — colored green/amber/red per value. Then up to 3 chips each from `positive_indicators` (emerald) and `distress_indicators` (rose).
  4. **Top 2 drivers** by `weight`, with a small ↑/→/↓ glyph for direction and a one-line `explanation`.
  5. **Recommended product** — first item from `recommended_products` rendered as a primary chip (`product`) with `rationale` as muted subtext. (No `ActionPillsRow` — credit column has no card actions.)
  6. Muted footnote: `"Indicative · no bureau data"` (from caveats).
- Loading state: when `creditLoading && !creditAssessment`, render a 4th column skeleton (label "Creditworthiness", 3 pulsing slate bars) so layout doesn't reflow.
- Empty state: if `creditAssessment === null && !creditLoading`, **omit** the 4th column (render only 3 — matches existing fallback behavior for missing data).

### 4. Layout adjustments

- Container at line 834 is `flex items-stretch gap-3`. With 4 children it can get tight at narrow widths — reduce `gap-3` → `gap-2` only when 4 columns are present (conditional class) and let `flex-1 min-w-0` continue to do the work. No grid swap needed; the panel is desktop-only per the memory rule.
- Vertical divider logic (`{i > 0 && <div className="w-px bg-slate-200..." />}`) continues to insert dividers between all 4 columns.

---

## Out of scope

- No new edge functions — `assess-creditworthiness` is already deployed.
- No changes to other tabs (Relationship, Analytics, Purchase Cycle).
- No changes to risk pipeline, sample data, classification, or memory.
- No mobile/responsive work (panel is desktop-gated).

## Verification

After implementation:
1. Load `/deckmo` (or wherever ExecDemoPage is reachable), pick a demo customer, wait for enrichment.
2. Confirm 4th "Creditworthiness" column appears with score/band/drivers/recommended product.
3. Customer switch resets the column.
4. Network tab shows one `POST .../assess-creditworthiness` per customer, returning the shape above.
