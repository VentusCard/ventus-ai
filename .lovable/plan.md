## Goal

Teach `classify-transactions` to recognize **incomes** by adding a **13th pillar: "Income & Inflows"**. LLM-driven. Merchant refunds keep their normal spending pillar (so a Whole Foods return still counts as Grocery) but are flagged as inflows via a separate `flow` field.

## Changes

### 1. `supabase/functions/classify-transactions/index.ts`

**a. Prompt — add pillar 13** (keep 1–12 unchanged):

```
13. Income & Inflows: Payroll, Reimbursements, Investment Income,
    Government Benefits, Tax Refunds, Transfers In, Interest Earned,
    Rental Income, Gifts Received, General
```

(Note: merchant refunds are intentionally NOT a category here — see refund rule below.)

**b. Add an INCOME vs SPEND section to the prompt:**

```
INCOME vs SPEND (flow field):
Every transaction gets a "flow" value: "income" or "spend".

flow = "income" when money flows INTO the account. Signals:
  PAYROLL, DIRECT DEPOSIT, DES: PAYROLL, ACH CREDIT, REFUND, RETURN,
  REIMBURSEMENT, DIVIDEND, INTEREST PAID/EARNED, IRS TREAS, SSA TREAS,
  TAX REF, VENMO CASHOUT, ZELLE FROM <person>, RENTAL INCOME, REBATE,
  CASHBACK REDEMPTION.

flow = "spend" for all normal purchases.

PILLAR ROUTING for income:
• Payroll, government benefits, dividends, interest, tax refunds, transfers
  in, rental income, gifts received → pillar "Income & Inflows".
• MERCHANT REFUNDS / RETURNS → keep the merchant's NORMAL spending pillar.
  Example: "WHOLE FOODS REFUND" → Food & Dining / Grocery, flow="income".
  Example: "AMAZON RETURN" → Home & Living / General, flow="income".
  Example: "DELTA AIR LINES REFUND" → Travel & Exploration / Flights,
           flow="income".
  Rationale: refunds reverse a specific spend category; keeping the pillar
  lets analytics net them against the original spend.

For Income & Inflows rows: spending_tier = "N/A". purchase_frequency
reflects cadence (Payroll → Monthly/Weekly; Tax Refund → Annually;
Interest → Monthly).
```

Add 4–5 examples under a new "Income & Inflows:" example block (Employer payroll, IRS TREAS tax refund, Vanguard dividend, SSA benefit, Venmo cashout) AND 2–3 refund examples that stay in spending pillars under their normal pillar blocks (WHOLE FOODS REFUND, AMAZON RETURN, DELTA REFUND).

**c. Tool schema** — two updates:
- Extend `pillar` enum with `"Income & Inflows"`.
- Add `flow` field:
  ```ts
  flow: { type: "string", enum: ["income", "spend"] }
  ```
  Add `"flow"` to the `required` array.

**d. Merge step** — include `flow` on the enriched object; default to `classification.flow ?? "spend"`. Fallback branches (failed classification) also set `flow: "spend"`. No deterministic overrides — leave it entirely to the LLM as requested.

### 2. `src/lib/transactionFlow.ts`

Update `getFlow()` to prefer the explicit field, falling back to the existing regex for sample data that bypasses the classifier:

```ts
export function getFlow(tx: {
  flow?: Flow;
  merchant_name?: string;
  merchant?: string;
  description?: string;
}): Flow {
  if (tx.flow === "income" || tx.flow === "spend") return tx.flow;
  // existing regex fallback unchanged
}
```

`isIncome()`, `formatAccounting()`, `stripIncome()`, and `buildAdvisorContext` all read through `getFlow()` and automatically inherit the new field. Refunds will correctly show as income (green, no brackets) AND still appear in their pillar's spend aggregation totals — which is the desired netting behavior for merchant returns.

> Note: `stripIncome()` currently excludes ALL income from aggregations. With refunds now flagged income, they'd be excluded too — defeating the "net against spend" intent. Update `stripIncome()` to only exclude income when `pillar === "Income & Inflows"`, keeping refunds in their pillar's totals.

### 3. Pillar color palette

Add "Income & Inflows" to the pillar color map using an **emerald/green** hue (matches existing income tint in `ExecDemoLeftPanel`). Red stays reserved for risk.

## Out of scope

- No CSV data changes.
- No DB migrations.
- No UI layout changes — formatting and tinting already flow through `getFlow()`.