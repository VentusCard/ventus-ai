

# Speed Up Semantic Deal Search

## Optimizations (ordered by impact)

### 1. Switch to a faster model
Change from `google/gemini-3-flash-preview` to `google/gemini-2.5-flash-lite`. This is the fastest and cheapest model available. For a simple "match query to merchant names" task, it has more than enough capability and will significantly reduce latency.

### 2. Reduce payload size — stop sending full deal objects
Instead of sending all 60+ deal objects from the client on every keystroke, hardcode or cache the deal catalog on the edge function side. The deals list is static data from `availableDealsData.ts`. Two options:
- **Option A (recommended):** Embed the deal catalog directly in the edge function. The client only sends the query string — no deals array. This cuts the request payload from ~15KB to ~50 bytes.
- **Option B:** Send only a minimal representation (id + merchant name) instead of all 6 fields.

### 3. Trim the prompt
Remove unnecessary fields from the prompt sent to the AI. The model only needs merchant name and category/subcategory to make a match. Remove `dealTitle` and `rewardValue` from the prompt template to reduce token count by ~30%.

### 4. Add request cancellation (AbortController)
When the user types a new character before the previous search completes, cancel the in-flight request. This prevents wasted work and ensures the UI shows results for the latest query faster.

### 5. Increase debounce to 700ms
Slightly longer debounce reduces the number of API calls while the user is still typing, without noticeably affecting perceived speed.

---

## Technical Details

### Edge Function (`supabase/functions/semantic-deal-search/index.ts`)
- Change model to `google/gemini-2.5-flash-lite`
- Import/embed a compact deal catalog (id, merchant, category, subcategory) directly in the function
- Accept only `{ query: string }` in the request body (no deals array)
- Shorten the user prompt by removing dealTitle and rewardValue

### Hook (`src/hooks/useSemanticDealSearch.ts`)
- Send only `{ query }` in the request body (remove deals mapping)
- Add an `AbortController` ref; abort previous request on new search
- Increase debounce from 500ms to 700ms
- The hook no longer needs the `deals` parameter

### Component (`src/components/tepilot/rewards-pipeline/AvailableDealsGrid.tsx`)
- Remove deals prop from `useSemanticDealSearch()` call (no longer needed)

---

## Expected improvement
These changes combined should reduce end-to-end latency from ~2-3 seconds to under 1 second per search, primarily from the smaller model, smaller prompt, and eliminated payload overhead.

