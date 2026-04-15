

## Tighten Deal Recommendations: Practical Item Fit

### Problem
Generated deals sometimes include items that don't statistically fit the persona — the issue isn't brand names, it's suggesting products (e.g., electrolyte packets for a traveler) that have no logical connection to the customer's actual spending behavior.

### Change
Single file: `supabase/functions/generate-next-offers/index.ts` — update the system prompt with stronger product-fit guardrails.

### Prompt Updates (lines 34-50)

1. **Add a product relevance rule**: "Every deal must pass the 'would this person obviously buy this?' test. The product category must have a direct, common-sense connection to the behavioral cluster's spending patterns — not a loose thematic association."

2. **Replace the lateral thinking guidance** (line 45) with tighter examples:
   - Current: "a skier needs goggles, après-ski gear, action cameras. A foodie needs cookware, cooking classes, specialty ingredients."
   - New: "Think one step adjacent to what they already buy. A frequent flyer needs noise-cancelling headphones, a carry-on suitcase, packing cubes, a portable charger. A fitness enthusiast needs running shoes, a GPS watch, wireless earbuds, gym bag. A home cook needs a quality knife set, cast iron pan, spice subscription. Do NOT suggest supplements, vitamins, hydration packets, essential oils, or any wellness/health product unless the customer's transactions explicitly show health & wellness spending."

3. **Add explicit rejection list**: "NEVER suggest these unless the cluster is explicitly health/wellness: supplements, vitamins, electrolyte mixes, protein powders, essential oils, skincare serums, wellness subscriptions. These are statistically unlikely purchases for most personas."

4. **Add a statistical fit check instruction**: "Before finalizing each deal, verify: does this product category appear in or logically extend the customer's top merchant categories? If the answer is no, replace it with something they'd actually use."

No frontend changes needed.

