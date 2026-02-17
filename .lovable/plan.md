

# Create `deal-personalization` Edge Function

## Overview
The `DealActivationPreview` component already has the full frontend flow built (state, payload construction, response handling, UI rendering). It just needs the backend edge function to exist. Two changes are needed:

1. Create the edge function with the name `deal-personalization`
2. Update the one line in `DealActivationPreview.tsx` that calls `generate-partner-recommendations` to call `deal-personalization` instead

## What Already Works (No Changes Needed)
- Payload construction: slim deals `{id, m, c, r}`, slim profile (top 3 pillars), slim context (demographics + persona traits)
- Response parsing: maps `recs[].id/msg/cta` into `personalizedDeals` state
- UI rendering: AI-personalized messages shown with violet styling and sparkle icons
- Auto-trigger: runs automatically when enriched transactions are available
- Fallback: template-based personalization if AI fails

## Changes

### 1. Create `supabase/functions/deal-personalization/index.ts`
Based on the code you shared, with these project-standard adjustments:
- Use the standardized CORS headers (including `x-supabase-client-platform` etc.)
- Use the ALLOWED_ORIGINS pattern from other edge functions (regex-based origin matching)
- Model: `google/gemini-3-flash-preview` (creative personalization benefits from the stronger model)
- Dynamic system prompt with privacy guardrails (no specific amounts, no cross-merchant references)
- JSON cleanup to handle markdown-wrapped responses
- Proper error handling for 429/402 status codes

### 2. Update `supabase/config.toml`
Add:
```
[functions.deal-personalization]
verify_jwt = false
```

### 3. Update `src/components/tepilot/insights/DealActivationPreview.tsx`
Line 652: Change `"generate-partner-recommendations"` to `"deal-personalization"`

## Request/Response Contract

```text
POST /deal-personalization

Request:
{
  deals:   [{ id, m, c, r }],        // merchant name, category, reward
  profile: { pillars: [{n, s}], signals: [] },
  ctx:     { demo: {occ, fam, inc}, persona: {traits, interests} },
  txCount: number
}

Response:
{
  recs: [{ id: string, msg: string, cta: string }]
}
```

## Files
- **Create**: `supabase/functions/deal-personalization/index.ts`
- **Modify**: `supabase/config.toml` (add function entry)
- **Modify**: `src/components/tepilot/insights/DealActivationPreview.tsx` (line 652 -- rename function invocation)
