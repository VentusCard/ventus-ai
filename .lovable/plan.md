

## Goal

Reframe Curated Collection descriptions so they feel like **enhancements to the user's existing lifestyle** — not transactional ("we've got it covered") and not generic marketing. The user should read it and feel: "yes, these things make my [Hawaii trips / coffee runs / ski seasons] better."

## Tone shift

- ❌ "Aloha — we've got your island trip covered." (sounds transactional, like booking a hotel)
- ❌ "Craft unforgettable memories with premium essentials." (corporate filler)
- ✅ "Little things that make every island trip better."
- ✅ "Gear that keeps your courts and slopes seasons sharp."
- ✅ "Small upgrades for your morning coffee ritual."
- ✅ "Helpful picks for this next chapter."

## Change

**`supabase/functions/generate-next-offers/index.ts`** — update the `collectionMessage` instruction in BOTH system prompts (`SYSTEM_PROMPT` and `LIFE_EVENT_SYSTEM_PROMPT`):

1. **Length**: ≤ 10 words, ≤ 60 characters.
2. **Frame as enhancement, not coverage**: Use words like *better, sharper, easier, smoother, smarter, ritual, upgrade, elevate-the-everyday, picks, gear, little things, small touches*. Avoid "we've got you", "got covered", "handle", "take care of" — these sound like the bank is doing the trip/activity FOR them.
3. **Anchor to the pill label**: must echo the literal subject of the rollup (Hawaii → island/Hawaii; Coffee Runs → mornings/coffee/ritual; Ski → slopes/snow; College Prep → this chapter/the journey).
4. **Warm, second-person**: use *your* — keep it personal without being transactional.
5. **Banned vocabulary** (corporate filler + transactional tone): "unforgettable", "memories", "essentials", "premium", "indulge", "curated", "exclusive", "next escape", "we've got you", "got covered", "we handle", "we take care".
6. **Few-shot examples** in both prompts:
   - "Annual Hawaiian Vacations" → "Little things that make every island trip better."
   - "Tennis & Ski Seasonal Sports" → "Gear that keeps your seasons sharp."
   - "Weekly Workday Coffee Runs" → "Small upgrades for your morning ritual."
   - "College Preparation for Dependent" → "Helpful picks for this next chapter."

No UI changes — `collectionMessage` already renders verbatim.

## Files touched

- `supabase/functions/generate-next-offers/index.ts` (system prompts only)

## Verification

1. `/demo` → Next-Offer tab → click each persona pill → description reads like a friendly enhancement to the user's lifestyle, not like the bank booking something for them.
2. ≤ 10 words, anchors on the pill subject, contains *your*.
3. No instances of "we've got", "covered", "unforgettable", "essentials", "premium".

## Out of scope

Deal copy, layout, other tabs.

