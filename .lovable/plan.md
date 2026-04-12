

## Use Bank of America Products as Reference in Product Card Generation

### Change

**`supabase/functions/generate-product-cards/index.ts`** — Update the system prompt to instruct the AI to use real Bank of America product names and offerings as reference when generating cards.

Add to the system prompt after "You are a consumer banking product recommendation copywriter for 'TCBY Bank'":

```
Use real Bank of America products as reference for recommendations. Examples:
- Travel: Bank of America® Travel Rewards credit card, Bank of America® Premium Rewards® credit card
- Cash back: Bank of America® Customized Cash Rewards credit card, Bank of America® Unlimited Cash Rewards credit card
- Savings: Bank of America Advantage Savings, Bank of America Advantage SafePass® Savings
- Investing: Merrill Edge® Self-Directed, Merrill Guided Investing
- Home: Bank of America home equity line of credit, Bank of America mortgage
- Education: Merrill 529 College Savings Plan
- Retirement: Merrill IRA, Merrill Roth IRA
- Business: Bank of America® Business Advantage credit cards

Adapt the product name to match what Bank of America actually offers. Use their real product naming conventions.
```

One file edit, redeploy the edge function.

