

## Ground Deal Recommendations in Actual Spending Data

### Problem
The AI generates deals for categories the customer has no spending history in (e.g., "TRX training system" for a traveler with zero fitness spending). This happens because:
1. The prompt says "Think laterally" — encouraging the AI to invent tangential connections
2. Temperature is 0.8 — too creative for grounded recommendations
3. No explicit constraint tying deals back to observed spending

### Fix — `supabase/functions/generate-next-offers/index.ts`

1. **Replace "Think laterally" rule** (line 57) with a grounding constraint:
   - New rule: "All deals MUST relate to categories, merchants, or spending patterns present in the BEHAVIORAL CLUSTERS or SPENDING CONTEXT. Do NOT recommend products from categories where the customer has zero spending history. Boost deals should fill gaps WITHIN existing spending areas (e.g., a traveler missing luggage), not introduce entirely new lifestyle categories."

2. **Lower temperature** from `0.8` to `0.55` (line 109) — still allows variety but reduces hallucination of unrelated categories.

3. **Add negative instruction** to SIGNAL LOGIC section: "NEVER boost a category that has NO related spending in the provided clusters. If the customer has no fitness/sports transactions, do NOT recommend fitness equipment."

### Result
Deals stay relevant to observed behavior — lateral thinking within spending clusters, not across unrelated ones.

