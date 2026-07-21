## Fix: Consumer chat breakdown should use `category`, not `subcategory`

In `src/components/exec-demo/ExecDemoIntelPanel.tsx`, the click handler that dispatches the "How much do I typically spend on ..." prompt (Next-Conversation → Customers view) currently groups the enriched transactions by `subcategory` (line 751), which is why the chat answer lists sub-buckets like "Full-Service", "Resort", "Airlines", "Luau", etc.

### Change
- Line 751: replace `const bucket = tx.subcategory || tx.category || "Other";` with `const bucket = tx.category || tx.subcategory || "Other";` so it groups by top-level category (e.g. `Hotels & Lodging`, `Airlines`, `Dining`).
- Line 769: update the descriptor from `Breakdown by enriched subcategory:` to `Breakdown by enriched category:` so the LLM prompt matches.

No changes to the LLM, pill UI, or transaction data — only the grouping key used to build the AI context string.

### Expected result
The chat reply becomes:
```
Hotels & Lodging — $7,420 (Koa Kea Hotel, Grand Wailea Resort, Hilton Waikoloa Village)
Airlines — $2,705 (Hawaiian Airlines)
...
```
instead of the current sub-bucket list.