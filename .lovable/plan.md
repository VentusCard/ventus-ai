## Goal
Route generic big-box / general merchandise retailers (Target, Walmart, Amazon, Costco, etc.) to **Home & Living → General** in the classifier, instead of being mis-tagged as Grocery, Clothing, or Electronics based on a single SKU guess.

## Change — `supabase/functions/classify-transactions/index.ts`

In the LLM system prompt's "Home & Living" examples block (around lines 268–274), add explicit big-box mappings and a guidance note:

```
- "TARGET" / "TARGET STORES" → General / ["Department Store", "Big Box"]
- "WALMART" / "WALMART SUPERCENTER" → General / ["Big Box", "Discount"]
- "AMAZON" / "AMAZON.COM" / "AMZN MKTP" → General / ["Online Marketplace"]
- "COSTCO" / "COSTCO WHOLESALE" → General / ["Warehouse Club"]
- "SAMS CLUB" / "BJ'S WHOLESALE" → General / ["Warehouse Club"]
- "KOHLS" / "MACYS" → General / ["Department Store"]
```

Plus a short NOTE telling the model to keep these in **Home & Living → General** unless the description/MCC explicitly narrows the purchase to a specific category (groceries, clothing, electronics, etc.).

## Out of scope
- No other prompt or code changes.
- No re-deploy script changes (edge function deploys automatically).