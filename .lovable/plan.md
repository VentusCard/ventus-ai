## Problem

Persona synthesizer occasionally returns rollups like **"Premium Weekend Shopping Runs"** that bundle Whole Foods + Starbucks + Costco + Nordstrom + Lululemon. The unifying theme is just *"weekend"* + *"premium-ish"* — not an identity. A friend wouldn't describe this person as "a weekend shopper"; they'd say "she cares about food quality" or "she's into athleisure" — or nothing at all.

Hard regex bans are wrong here — phrases like "Weekend Golfer" or "Weekly Coffee Runs" are GOOD because the activity (golf, coffee) is the anchor. The fix has to operate at the **semantic** level inside the prompt.

## Fix — prompt-only, semantic guardrails in `supabase/functions/synthesize-persona/index.ts`

Add a new section **"THE IDENTITY TEST"** to the system prompt that forces the model to validate each candidate rollup against an individual-identity criterion before emitting it. No client-side regex, no enum bans on neutral words.

### 1. The Identity Test (new section, placed right before "RECURRING SPORT / FITNESS" rule)

The model must answer two questions for every candidate rollup. If either fails, drop the rollup.

**Q1 — The "fill in the blank" test:**
Complete this sentence using the rollup as the noun: *"This person is the kind of person who ___."*
- PASS: "...takes annual Hawaii trips", "...plays tennis every week", "...eats out at casual spots constantly", "...buys premium athleisure"
- FAIL: "...shops on weekends", "...spends premium amounts", "...has runs of purchases", "...goes on outings"

If the only honest completion is about *when* (weekend/evening/morning) or *how much* (premium/luxury/big-ticket) the spending happened, the rollup has no identity. Drop it.

**Q2 — The "single activity" test:**
Name the ONE activity, hobby, lifestyle, or merchant category at the heart of this rollup.
- PASS: golf, coffee, Hawaii travel, fine dining, athleisure, organic groceries, skincare
- FAIL: "shopping" (too generic), "spending" (not an activity), "outings" (too generic), "lifestyle" (circular), "errands"

If you can't name a concrete activity/lifestyle/category in 1–3 words, the transactions don't actually share an identity. Drop the rollup.

### 2. Worked failure example (added to the prompt)

Show the exact failure case the user reported, and explain *why* it fails the Identity Test:

> ❌ **"Premium Weekend Shopping Runs"** covering Whole Foods + Starbucks + Costco + Nordstrom + Lululemon.
> - Identity test Q1: "This person is the kind of person who shops on weekends." → Everyone shops on weekends. No identity.
> - Identity test Q2: Single activity? "Shopping." → Too generic; this lumps groceries, coffee, warehouse club, department store, and athleisure into one bucket.
> - Correct response: drop this rollup. If Lululemon + similar athleisure repeats elsewhere, emit "Athleisure Wardrobe" instead. If Whole Foods + organic markets repeats, emit "Organic Grocery Routine". Otherwise, emit nothing for these transactions.

### 3. Reinforce "when in doubt, emit fewer"

Add one line to the existing optionality guidance: *"A coherent individual identity is the only justification for a rollup. Timing patterns alone (weekend/evening) and price-tier alone (premium/luxury) are not identities — they're descriptors. Drop the rollup if no underlying identity holds the transactions together."*

### 4. Tighten cross-pillar guard with a concrete example

The prompt already says "only group categories within the SAME pillar," but the failure case crossed Food & Dining + Style & Beauty. Add: *"If your candidate rollup pulls transactions from more than one pillar (e.g. groceries + clothing), that's a structural sign there's no shared identity — split or drop."*

## What's NOT changing

- No regex blocklist on the client.
- No enum changes to allowed labels.
- No banning of neutral words like "Weekend" or "Premium" — they're fine when paired with a real activity ("Weekend Golfer", "Premium Hawaii Vacations").
- No model swap.
- No schema changes.
- Life event detection unchanged (working correctly).

## File changes

- `supabase/functions/synthesize-persona/index.ts` — system prompt edits only (sections 1–4 above).

Then redeploy `synthesize-persona`.
