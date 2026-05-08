## Goal
Add a "Website" field to the demo customization dialog so the bank's URL is persisted alongside the name and threaded into downstream edge functions (so they can search / cite the actual bank when generating copy).

## Changes

### 1. `src/lib/demoBankConfig.ts`
- Extend `DemoBankConfig` and `BankPromptContext` with optional `website?: string`.
- Add `normalizeUrl()` helper: trim, slice to 200 chars, prepend `https://` if no scheme.
- Persist + return `website` in `getDemoBankConfig` / `setDemoBankConfig` / `getBankPromptContext`.

### 2. `src/components/demo/SimplePasswordGate.tsx`
- Add a third input under "Bank name" / "Shorthand" in the custom-mode form:
  - Label: **Website** (optional)
  - Placeholder: `e.g. firstnational.com`
  - `maxLength={200}`, `type="url"`, `inputMode="url"`
- Wire to `cfg.website`; saved by existing Save handler.

### 3. Edge functions
`bankContext` is already passed; downstream functions destructure with extras allowed, so `website` automatically flows through to:
- `consumer-chat`, `generate-product-cards`, `generate-product-actions`, `generate-next-offers`, `synthesize-persona`, `analyze-lifestyle-signals`, `detect-risk-transactions`

Update prompt injection in the two functions that already inline `bankContext`:
- **`supabase/functions/consumer-chat/index.ts`** — when `bankContext.website` is present, append to BANK IDENTITY block: `Official site: ${website}. You may reference this site when pointing customers to bank products or contact pages.`
- **`supabase/functions/generate-product-cards/index.ts`** — when `website` present, add to system prompt: `Bank's official website is ${website} — product naming and tone should match a real institution at that domain.`
- **`supabase/functions/generate-product-actions/index.ts`** — append to bank prefix: `Reference site: ${website} for context.`

No edge functions actually do live web search yet — the `website` is metadata the LLM uses to ground tone / references. (If you later want a real Firecrawl-powered search step before generation, that's a separate follow-up.)

## Out of scope
- No actual scraping of the bank site (would need Firecrawl connector + caching). Can be added later if you want generated copy to mirror real product names from the site.
- No display of the website on the gate screen header.

## Files touched
- `src/lib/demoBankConfig.ts`
- `src/components/demo/SimplePasswordGate.tsx`
- `supabase/functions/consumer-chat/index.ts`
- `supabase/functions/generate-product-cards/index.ts`
- `supabase/functions/generate-product-actions/index.ts`
