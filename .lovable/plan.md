

# AI-Powered Financial Coaching Tips via Edge Function

## Overview
Create a new edge function `generate-financial-tip` that uses Lovable AI to generate a single contextual coaching tip based on the customer's real enriched transactions AND their profile data (demographics, holdings, lifestyle type). Replace the current hardcoded `generateFinancialTip()` with an async call to this function.

## Edge Function: `supabase/functions/generate-financial-tip/index.ts`

- Accept `{ transactions: EnrichedTransaction[], customer: { name, age, occupation, familyStatus, segment, lifestyleType, holdings } }`
- Use `google/gemini-3-flash-preview` via Lovable AI gateway
- System prompt: "You are a bank's financial coaching engine. Generate ONE tip based ONLY on observable banking data (transaction amounts, merchants, frequencies, pillar distribution, spending tiers). Never reference usage metrics, external balances, or anything not visible from transactions. When customer demographics are provided, use them to make the tip more relevant (e.g., family-oriented advice for married customers, career-related for young professionals)."
- Use tool calling for structured output: `{ message, category, potentialSavings, icon }`
- Standard CORS + error handling (429/402)

## Customer data usage
Pass customer profile info only when meaningful fields exist — the edge function prompt will incorporate demographics like age, occupation, family status, and holdings to personalize advice (e.g., suggesting 529 plans for parents, or investment diversification for high-AUM customers).

## UI Changes: `src/components/demo/DemoEngagementView.tsx`

- Replace synchronous `generateFinancialTip()` with `useEffect` + `supabase.functions.invoke('generate-financial-tip', { body: { transactions, customer } })`
- Add loading state with skeleton placeholder
- Keep existing `FinancialTip` interface and card rendering unchanged
- Build customer context object from `DemoCustomer.profile` before passing

## Config
- Add `[functions.generate-financial-tip]` with `verify_jwt = false` to `supabase/config.toml`

## Files
1. **Create**: `supabase/functions/generate-financial-tip/index.ts`
2. **Edit**: `src/components/demo/DemoEngagementView.tsx` — async tip fetching with customer context
3. **Edit**: `supabase/config.toml` — add function entry

