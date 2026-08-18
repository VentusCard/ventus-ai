# Fix: live generation never reaches the backend

## What's happening

The "Live generation didn't return for this customer" banner is not a model or prompt problem. The frontend is not pointed at the project backend at all.

Confirmed from the preview's network log: both `generate-next-offers` and `generate-product-cards` are being POSTed to `http://127.0.0.1:54321/...` and fail instantly with `Failed to fetch`. That address is the local-development fallback in `src/integrations/supabase/client.ts`, used whenever the backend URL/key environment variables are empty.

Confirmed from the environment file: it currently contains only the Google Maps connector keys. The three backend variables (`VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) that `.env.example` documents are missing, so `isSupabaseConfigured` is false and every edge-function call in the app — not just personalization — silently falls back to the dead local address.

The live backend itself is healthy: a direct request to the deployed `generate-next-offers` function responds (400 on an empty body, i.e. the function is up and reachable).

## Fix

1. Restore the three backend environment variables in the project env file, keeping the existing Google Maps connector entries intact.
2. Restart the dev server so Vite picks up the new values.
3. Verify with the preview: open `/bankdemo`, go to a Personalization tab, select Ricky, and confirm the two function calls now go to the project backend and return deals and product cards instead of the amber fallback banner.

## Notes

- No application code changes are needed; `personalizationGeneration.ts`, `personalizationResultStore.ts`, and `CustomerMockupPanel.tsx` already handle progressive rendering and failures correctly — they were correctly reporting a real network failure.
- This also silently affected every other backend-backed feature (enrichment, chat, campaign generation) in this preview session, so the same fix restores those.
