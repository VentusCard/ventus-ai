# Fix: "Live generation didn't return for this customer"

## Cause (verified)

The frontend is not pointed at the project backend.

- The preview network log shows `generate-next-offers` and `generate-product-cards` POSTed to `http://127.0.0.1:54321/...`, failing instantly with `Failed to fetch`. That address is the local-development fallback used when the backend URL/key variables are empty.
- The project env file currently contains only the two Google Maps connector keys. The three backend variables documented in `.env.example` (`VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) are missing.

So the banner is accurate: generation is failing at the network layer, not in the model or prompts. This is the same regression as before — the env values keep getting dropped from the preview environment.

## Fix

1. Restore the three backend environment variables in the project env file, leaving the Google Maps entries intact.
2. Restart the dev server so Vite picks up the values.
3. Verify in the preview: load `/bankdemo`, open a Personalization tab, select Ricky, and confirm both function calls return 200 and deals plus product cards render with no amber fallback banner.

## Notes

- No application code changes. `personalizationGeneration.ts`, `personalizationResultStore.ts`, and `CustomerMockupPanel.tsx` already handle progressive rendering and failure fallback correctly.
- The same gap breaks every other backend-backed feature in this preview (enrichment, chat, campaign generation); this restores those too.
