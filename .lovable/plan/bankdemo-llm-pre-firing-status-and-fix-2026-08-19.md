# /bankdemo LLM pre-firing: status and fix

## What I checked

- `prewarmDefaultCustomer()` is exported from `personalizationResultStore.ts` and is called on mount of `CustomerMockupPanel.tsx`, so the wiring is intact.
- The project env file currently contains only the Google Maps connector keys. The three backend variables (project id, backend URL, publishable key) are missing again.
- Because of that, `isSupabaseConfigured` is false and the client falls back to `http://127.0.0.1:54321`, so every pre-fired call fails instantly.

So pre-firing does fire, but it cannot reach the backend — the "Live generation didn't return" fallback will show for Ricky.

Second, narrower point: the prewarm only runs when a Personalization tab mounts (`CustomerMockupPanel`), not when `/bankdemo` itself loads. If the intent is warming as soon as the dashboard opens, that trigger needs to move up.

## Fix

1. Restore the three backend environment variables in the project env file, keeping the Google Maps entries intact.
2. Restart the dev server so Vite picks up the values.
3. Move the `prewarmDefaultCustomer()` call from `CustomerMockupPanel.tsx` to a mount effect in `AnalyticsContainer.tsx` so Ricky warms on `/bankdemo` load rather than on first personalization-tab visit (the module-level `hasPrewarmed` guard keeps it one-shot).
4. Verify in the preview: load `/bankdemo`, confirm `generate-next-offers` and `generate-product-cards` return 200, then open a Personalization tab, select Ricky, and confirm generated deals/product cards render with no amber banner.

## Notes

- No changes to prompts, edge functions, or generation logic.
- The env gap also breaks every other backend-backed feature in this preview (enrichment, chat, campaign generation); the same fix restores those.
