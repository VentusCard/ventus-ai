# Fix: deal search on the section 6 phone returns nothing

## What's wrong

The search bar now keeps focus while typing, but every search request goes to `undefined/functions/v1/semantic-deal-search` (seen in the preview's network log). The search hook builds the address from an environment value that isn't present in the running preview, so the request never reaches the search service and the results stay empty.

## Fix

1. Make the search hook always reach the service: fall back to the project's known public backend address and public key when the environment values are missing (same public values the app already uses), keeping the existing debounce, cancel-in-flight, and empty-result handling.
2. Complete the pending search redesign from the earlier request:
   - Only keep merchants the search is highly confident actually sell the item (e.g. "coffee machine" no longer returns Dyson); an empty result shows "No matching deals found".
   - Results shown one deal per row, styled like the collection cards.
3. Verify on /deckmo slide 6: type "coffee machine" and "tennis racket" letter by letter, confirm results appear, clearing works, and arrow-key slide navigation still works.

## Technical notes

- `src/hooks/useSemanticDealSearch.ts`: `const base = import.meta.env.VITE_SUPABASE_URL || "https://qopysdercrqgwcrawndl.supabase.co"`, same for the publishable key.
- `supabase/functions/semantic-deal-search/index.ts`: tool schema `matches: [{id, confidence, why}]`, keep `confidence >= 0.9`, validate IDs against the catalog, strict purchase-intent prompt; response shape unchanged. Redeploy.
- `GeneratedOffersPhoneView.tsx`: results block `grid-cols-2` → single-column collection-style cards.
