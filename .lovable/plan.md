## Fix

Cap `generate-product-cards` edge function at 2 non-risk cards (3 if risk appended), down from 4/5. The middle column already only displays 2 — and we've now matched that on the phone — so generating 4 is wasted tokens.

### `supabase/functions/generate-product-cards/index.ts`

1. **Lines 33–45 — system prompt header + card order:**
   - "UP TO FOUR" → "UP TO TWO"; "FIVE if risk" → "THREE if risk"
   - Drop slots 3 (life_event_2) and 4 (behavioral_2); risk becomes slot 3
   - Replace fallback rules (1 life event / 1 rollup → 3 cards) with simpler: no life events → 1 behavioral; no rollups → 1 life event; cap at 2 non-risk

2. **Line 200 — user prompt:**
   - `Return up to ${topRisk ? 5 : 4} cards` → `Return up to ${topRisk ? 3 : 2} cards`

3. **Line 219 — tool description:**
   - `"Return up to 4 consumer product recommendation cards in strict interleaved order: life_event_1, behavioral_1, life_event_2, behavioral_2"` → `"Return up to 2 consumer product recommendation cards in strict interleaved order: life_event_1, behavioral_1 (plus optional risk card)"`

4. **Revert `RelationshipPhoneView.tsx` slice** — not needed once edge function is capped (no `.slice(0, 2)` change required since we never made it).

Then redeploy `generate-product-cards`.
