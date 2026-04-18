

## Issue
Current multi-category rollups (e.g., "Premium Organic & Fine Dining" mixing Whole Foods grocery + $7 Starbucks + $215 Mama's Fish House) feel forced and dishonest. The user still wants multi-category rollups — but only when they actually make intuitive sense.

## What "intuitive" means here
A rollup should feel like something a friend would naturally say in one breath:
- ✅ "Weekend golfer" (golf course + pro shop + golf apparel)
- ✅ "Fitness regular" (gym + yoga studio + athletic wear)
- ✅ "Coffee shop regular" (Starbucks + local cafés + breakfast spots)
- ❌ "Premium Organic & Fine Dining" (grocery + coffee + fine dining — three different activities)
- ❌ "Strategic Domestic Traveler" (hotel + gym in destination city)

The test: **one activity, one tier, repeated behavior.**

## Fix — `supabase/functions/synthesize-persona/index.ts`

Tighten the prompt with three hard rules, plus a server-side validator:

**Rule 1 — One activity per rollup.**
Categories must share a *single behavioral activity*, not just a pillar. Grocery, dining out, and coffee are three activities even though all are Food & Dining. Add explicit examples in the prompt:
- Group: gym + yoga + athletic apparel (one activity: fitness)
- Don't group: grocery + dining out (two activities: cooking-at-home vs eating-out)
- Don't group: coffee runs + fine dining (two activities: caffeine habit vs special occasions)

**Rule 2 — Tier homogeneity.**
All categories in a rollup must share the same spending tier. Never mix Premium with Standard/Budget. The prompt already passes `[tier]` per category — make this a hard constraint.

**Rule 3 — Repetition threshold.**
A rollup needs evidence of a *habit*, not isolated purchases:
- At least 2 categories
- Each included category needs ≥2 transactions
- OR the combined rollup has ≥4 transactions across categories
Single-transaction categories stay as standalone chips.

**Server-side validator (after LLM returns):**
- For each proposed rollup, check tier homogeneity using the input data
- Check transaction-count thresholds
- Drop any rollup that fails; its categories fall back to individual chips
- Log dropped rollups for visibility

**Prompt additions:**
- A short "good vs bad" examples block showing 2 valid rollups and 2 invalid ones (using the Starbucks/Whole Foods/Mama's Fish House case as a "bad" example)
- Explicit instruction: "If in doubt, leave categories ungrouped. Individual chips are better than a forced rollup."

## Out of scope
- No UI/rendering changes
- No changes to risk pills, life events, product cards, or chip layout
- No client-side filtering — all logic stays in the edge function

## Expected result for Sarah
- Whole Foods, Starbucks, and Mama's Fish House appear as **3 separate chips** (different activities, mixed tiers, single transactions each)
- Multi-category rollups still appear when she has genuine repeat patterns — e.g., if she has 3 gym visits + 2 yoga classes + athletic apparel, those collapse into "Fitness Regular"
- Travel-related repeat behavior (e.g., 4 coffee shops + 3 casual lunches in one trip window) can still roll up as "Coffee & Casual Bites" since they share activity + tier

