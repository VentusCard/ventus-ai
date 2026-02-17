

# Create `local-experiences` Edge Function and Wire Up `useCityDeals` Hook

## Overview
The "Local Experiences" section in `DealActivationPreview` is fully built on the frontend (category tabs, loading states, deal rendering) but the `useCityDeals` hook is a placeholder that always returns empty deals. Two things are needed:

1. Create the `local-experiences` edge function (from the code you shared)
2. Wire up `useCityDeals` to actually call it

## Changes

### 1. Create `supabase/functions/local-experiences/index.ts`
Based on the code you shared, with one adjustment:
- Add the full CORS `Access-Control-Allow-Headers` to include `x-supabase-client-platform` and related headers (project standard)

Everything else stays as-is: `google/gemini-2.5-flash` model, category-based prompts, graceful fallbacks on parse errors or API failures.

### 2. Add to `supabase/config.toml`
```
[functions.local-experiences]
verify_jwt = false
```

### 3. Rewrite `src/hooks/useCityDeals.ts`
Replace the placeholder with a real implementation that:
- Calls `supabase.functions.invoke("local-experiences", { body: { city, category } })`
- Triggers on city or category change (via `useEffect`)
- Maps the response `deals` array into `CityDeal[]` objects (adding `id`, `name`, `description`, `category` from the `type` and `merchantExample` fields)
- Sets `loading` state properly
- Skips the call if city is null/empty

### No changes needed in `DealActivationPreview.tsx`
The component already:
- Passes `locationCity` and `localCategory` to `useCityDeals()`
- Renders `locationDeals` with loading/empty states
- Has category tab switching that updates `localCategory`

## Request/Response Contract

```text
POST /local-experiences

Request:  { city: string, category: string }
Response: { deals: [{ type: string, merchantExample: string }] }
```

## Files
- **Create**: `supabase/functions/local-experiences/index.ts`
- **Modify**: `supabase/config.toml` (add function entry)
- **Modify**: `src/hooks/useCityDeals.ts` (replace placeholder with real API call)
