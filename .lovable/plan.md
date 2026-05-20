
## Goal

Add a new edge function **`assess-creditworthiness`** that consumes the same enriched-transaction stream the rest of the demo workflow uses (output of `classify-transactions` + the 13th `Income & Inflows` pillar + `flow` field) and produces a structured creditworthiness assessment for a single customer.

No frontend, no DB changes, no sample data changes. Drop-in sibling of `detect-risk-transactions` and `analyze-lifestyle-signals`.

---

## Function contract

**Path:** `supabase/functions/assess-creditworthiness/index.ts`
**Config:** add `[functions.assess-creditworthiness] verify_jwt = false` to `supabase/config.toml`.
**Method:** `POST`. **CORS:** reuse the `ALLOWED_ORIGINS` / `getCorsHeaders` block used by the other functions.

### Request body

```ts
{
  client: {
    name: string;
    age?: number;
    occupation?: string;
    industry?: string;
    income_level?: string;     // demographic band, optional
    family_status?: string;
    segment?: string;          // Preferred | Private | Premium
  };
  transactions: EnrichedTransaction[];   // includes pillar, subcategory, flow, amount, date
  window_days?: number;                  // default 90
}
```

No raw SQL, no service-role usage. Pure compute over the payload.

### Response body

```ts
{
  score: number;                       // 300-850, lender-style band
  band: "Excellent" | "Good" | "Fair" | "Limited" | "Poor";
  confidence: number;                  // 0-100
  summary: string;                     // 1-2 sentence advisor-facing headline
  drivers: {
    label: string;
    direction: "positive" | "negative" | "neutral";
    weight: number;                    // 0-1, relative contribution
    explanation: string;               // grounded in observed transactions
  }[];                                 // 4-7 items
  affordability: {
    estimated_monthly_inflow: number;
    estimated_monthly_outflow: number;
    estimated_dti_proxy: number;       // recurring-debt-like outflow / inflow
    surplus_ratio: number;             // (inflow - outflow) / inflow
  };
  signals: {
    income_stability: "stable" | "variable" | "thin" | "unknown";
    cashflow_volatility: "low" | "medium" | "high";
    discretionary_pressure: "low" | "medium" | "high";
    distress_indicators: string[];     // e.g. ["NSF Fee", "Payday Loan"]
    positive_indicators: string[];     // e.g. ["Recurring Payroll", "Investment Contributions"]
  };
  recommended_products: {
    product: string;                   // free-form, e.g. "Secured credit-builder card"
    rationale: string;
  }[];
  caveats: string[];                   // model uncertainty + data-window notes
}
```

---

## Implementation outline (one file, ~300 lines)

1. **Deterministic pre-pass** over `transactions`:
   - Split by `getFlow()` semantics inline — treat `tx.flow === "income"` OR `tx.pillar === "Income & Inflows"` as inflow; all else as outflow. Use `Math.abs(amount)` on both sides.
   - Compute, scoped to the last `window_days`:
     - total inflow, total outflow, net cashflow, surplus_ratio
     - normalized **monthly** inflow/outflow (scale by `window_days / 30`)
     - payroll cadence: count of inflow rows whose `subcategory ∈ {Payroll, Direct Deposit}` grouped by month → `income_stability`
     - per-month outflow stdev / mean → `cashflow_volatility` bucket
     - distress hit-counts from `pillar === "Financial Distress"` (Overdraft/NSF, Pawn/Payday, Debt Collection, Subprime, Check Cashing) — surface labels in `distress_indicators`
     - positive hit-counts from `pillar === "Income & Inflows"` subcategories (Payroll, Investment Income, Interest Earned, Rental Income, Tax Refunds) — surface labels in `positive_indicators`
     - DTI proxy = (sum of outflow in subcategories matching `/mortgage|auto loan|student loan|credit card payment|personal loan|loan payment/i` plus all `Financial Distress` outflows) / monthly inflow
   - Bundle into a compact `MetricsPack` object passed to the LLM as context.

2. **LLM call** via Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`), same auth header + 429/402 handling as the other functions.
   - Model: `google/gemini-2.5-flash`, fallback `openai/gpt-5-mini` on non-2xx.
   - Tool calling with a `CREDITWORTHINESS_TOOL` whose JSON schema mirrors the response body above; `required` covers every top-level field plus `drivers[*]`, `affordability.*`, `signals.*`.
   - System prompt rules:
     - "You are a credit-risk analyst. Do **not** issue a credit decision; produce an indicative behavioral assessment grounded only in the supplied transactions."
     - Score band mapping: 300–579 Poor, 580–669 Fair, 670–739 Limited→Good (Limited reserved for thin-file), 740–799 Good, 800–850 Excellent. Thin file (<30 days of data OR <5 inflow rows) → cap score at 680 and set band to "Limited", confidence ≤ 60.
     - Drivers must cite **observed pillars / subcategories / merchants** — no speculation about credit bureau data, no FICO claims.
     - `recommended_products` constrained to: secured card, credit-builder loan, unsecured card upgrade, debt-consolidation loan, HELOC, personal loan, auto refi, mortgage pre-qual, wealth onboarding. No external brand names.
     - Honor the project's "vaguely specific" memory rule: behavioral labels, no exact counts/amounts.
     - `caveats` MUST include "Indicative model, not a credit decision; no bureau data used."
   - User prompt includes: client demographics, `window_days`, `MetricsPack`, and a truncated transaction sample (top 30 inflows by amount + top 30 outflows by amount + all `Financial Distress` rows, capped at 100 lines total).

3. **Merge step**:
   - Parse the tool call. If absent or malformed, return a deterministic fallback object built purely from `MetricsPack` (`band="Limited"`, `confidence=40`, generic driver list).
   - Overwrite `affordability` with the deterministic numbers regardless of what the LLM returned — the LLM may not do math reliably.
   - Clamp `score` to [300, 850] and `confidence` to [0, 100].
   - Always echo back `window_days` actually used.

4. **Logging**: `console.log` the deterministic metrics, the score/band/confidence, and any LLM failure — matching the verbosity of `detect-risk-transactions`.

---

## Out of scope

- No DB tables, no migrations, no storage.
- No edits to `classify-transactions`, sample data, or any frontend file.
- No changes to `getFlow()` / aggregations — function reads `flow` and `pillar` directly to stay self-contained.
- No automated tests in this round (function is LLM-driven; structural tests can follow once a UI exists).

## Testing approach (after deploy)

Use `supabase--curl_edge_functions` against `/assess-creditworthiness` with a payload built from one of the existing demo customers' enriched transactions (e.g. via the exec-demo dataset) to confirm:
1. Deterministic affordability numbers are sane.
2. Tool call parses; score lands inside band; thin-file cap fires when transactions are trimmed.
3. 402/429 paths return the expected JSON shapes.
