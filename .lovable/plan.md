

## Problem
P2P transactions like Zelle/Venmo show a person's name as the merchant (e.g. "MARIA GARCIA"). The actual classification signal lives in the **description** field ("Dogsitting"). Right now `classify-transactions` strips the description before sending to the LLM, so it gets classified as Misc instead of Pets.

## Fix
Pass the `description` field through to the LLM and add explicit prompt guidance for P2P payments.

### 1. `supabase/functions/classify-transactions/index.ts`
**Include description in the payload sent to the model** (line ~541):
```ts
const transactionSummary = transactions.map((t) => ({
  id: t.transaction_id,
  merchant: t.merchant_name,
  description: t.description || undefined,  // NEW
  amount: t.amount,
  date: t.date,
  ...(t.zip_code && { zip: t.zip_code }),
}));
```

**Add P2P guidance to `CLASSIFICATION_PROMPT`** (in the MERCHANT PARSING section):
```
P2P PAYMENTS (Zelle, Venmo, Cash App, PayPal):
• When merchant looks like a person's name AND source is Zelle/Venmo/Cash App,
  the description field IS the classification signal — use it as the primary clue.
• Examples:
  - "MARIA GARCIA" + description "Dogsitting" → Pets / Pet Services / ["Dogsitting"]
  - "JOHN SMITH" + description "Rent" → Home & Living / Rent & Mortgage / ["Rent"]
  - "SARAH LEE" + description "Yoga class" → Sports & Active Living / Gym & Fitness / ["Classes"]
  - "MIKE CHEN" + description "Birthday gift" → Family & Community / Gifts & Donations / ["Gift"]
• If description is empty for a P2P transfer, fall back to Family & Community / General with low confidence.
```

### 2. (No schema change needed)
`Transaction` type already has `description?: string`, and sample data already populates it.

### Outcome
"MARIA GARCIA — Dogsitting — $150 — Zelle" will classify as **Pets / Pet Services / ["Dogsitting"]** with high confidence, flowing correctly through to the persona, deals, and analytics pipelines.

