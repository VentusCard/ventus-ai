# Cap product-card copy at ~90 characters

Make the product-card quote short and punchy by tightening the generation rule and the rendering fallback to a 90-character ceiling.

## Changes

### 1. Generation prompt — `supabase/functions/generate-product-cards/index.ts`
- Line 117: change the hard limit from "ONE complete sentence, 90–140 characters" to "ONE complete sentence, 90 characters or fewer".
- Trim the five example quotes (lines 123–127) so every example itself fits within 90 characters, e.g.:
  - "Refinancing could save you an estimated $1,400 over the loan." (62)
  - "At 3x on travel, that's roughly $215 back on your next trip." (61)
  - "Your equity could unlock an estimated $45,000 for projects." (60)
- Keep the "complete sentence, never trail off, ends in a period" requirement unchanged.

### 2. JSON schema — same file, line 269
- Update the `quote` field description: "90 characters or fewer" instead of "90–140 characters".

### 3. Rendering safety net — `src/components/exec-demo/ProductCardsPhoneView.tsx`
- Change `QUOTE_MAX_CHARS` from 165 to 90 so `fitQuote` trims any over-long cached/snapshot copy at the last sentence boundary that fits the new budget.

### 4. Redeploy
- Redeploy the `generate-product-cards` edge function so the new rule takes effect.

### 5. Memory
- Save a rule noting product-card quote copy must be ≤90 characters.

## Technical notes
- Shorter copy also reduces output-token spend slightly.
- Existing session-cached cards are handled by the `fitQuote` fallback, so no stale long quotes can leak through.
