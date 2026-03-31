

## Fix Consumer Chat Prompt — Smarter Product Recommendations & Hyperlinked URLs

### Problem
1. The chatbot recommends products unprompted (e.g., suggesting a Travel Rewards card when the user just asked about skiing spend). Products should only be recommended when the user explicitly asks or when it's clearly relevant.
2. Full URLs are shown as raw text instead of markdown hyperlinks.

### Fix — `supabase/functions/consumer-chat/index.ts`

Update the `CONSUMER_SYSTEM_PROMPT` (lines 30-62) with two changes:

**1. Product recommendation rules** — Add explicit instruction:
- Only recommend products when the user explicitly asks for recommendations, or when a life event strongly signals a need.
- Never append product suggestions to spending analysis answers unless the user asked for them.

**2. Hyperlink formatting** — Change the product list to instruct the model to use markdown hyperlinks:
- Instead of listing raw URLs, tell the model: "Always format product links as markdown hyperlinks, e.g. `[Travel Rewards](https://...)`"
- Update the product list to show the markdown format as examples.

### Revised prompt section (capability #4):
```
4. PRODUCT RECOMMENDATIONS — ONLY recommend products when:
   a) The user explicitly asks for product recommendations, OR
   b) A detected life event strongly signals a product need (e.g., home purchase → mortgage)
   Do NOT append product suggestions to spending analysis answers.
   When recommending, use markdown hyperlinks:
   - [Customized Cash Rewards](https://www.bankofamerica.com/credit-cards/products/customized-cash-back-credit-card/)
   - [Travel Rewards](https://www.bankofamerica.com/credit-cards/products/travel-rewards-credit-card/)
   ... etc
```

### Files changed
1. `supabase/functions/consumer-chat/index.ts` — update system prompt

