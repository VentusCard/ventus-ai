## Problem

Generated signals come back too generic ("Sustained idle checking balance", "Multi-carrier travel pattern") — they could fit almost any product. The model isn't being forced to reason about what specifically distinguishes a buyer of *this* product.

## Fix

Tighten `supabase/functions/generate-lifestyle-signals/index.ts` so every signal is anchored to the product's actual use case, target customer, and competitive context.

### 1. Enrich the prompt input
Pass more product context from `ProductCampaignBuilderView.tsx` when available: `product.targetCustomer`, `product.keyFeatures`, `product.priceRange`, `product.competitors` (whichever fields exist on the product object — fall back gracefully).

### 2. Rewrite the system prompt
Replace the current generic strategist prompt with rules that force product-specificity:

- The signal must answer: "What does a customer who is about to need *this exact product* do in their transaction history that a customer who needs a different product does NOT do?"
- BANNED generic phrasings: "sustained idle balance", "multi-carrier travel", "recurring premium subscriptions", "high discretionary spend", "affluent lifestyle indicators", or any signal that could apply to 3+ unrelated products.
- Each signal label MUST reference a concrete merchant category, transaction archetype, or life-stage event tied to the product (e.g. for a HELOC: "Home improvement big-box runs", "Recurring contractor ACH", "Property tax lump sum"; for a travel card: "International POS in last 90d", "Airline ancillary fees", "Lounge day-pass purchases").
- Descriptions must name the *evidence* (merchant type, flow direction, cadence) and *why it predicts fit for this product specifically* in ≤18 words.

### 3. Reinforce via user prompt
Restructure user prompt as a checklist the model fills:
```
Product: {name}
What this product does: {positioning}
Target customer: {targetCustomer}

For each signal, internally answer:
- Which merchant category / transaction type?
- Why does this predict need for {productName} (not just general affluence)?
Then emit the signal.
```

### 4. Keep tone rules
Preserve existing "vaguely specific" rules (no exact $ or counts), no em dashes, no competitor names, no risk language, detectionRate 0.003–0.20.

### 5. Validate
After deploy, hit the function via `supabase--curl_edge_functions` for 2 different products (e.g. a HELOC vs a travel rewards card) and confirm signal sets are visibly different and product-anchored.

## Out of scope
Frontend UI, segment generation, imagery brief — only the signals edge function + its caller's input payload change.
