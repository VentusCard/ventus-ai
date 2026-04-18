

## Goal
Tighten `synthesize-persona` so the LLM emits **one rollup per behavioral theme**, and when in doubt always **defers to life events** (drops the behavioral rollup rather than the life event).

## Single change: `supabase/functions/synthesize-persona/index.ts`

Add two rules to the system prompt (alongside the existing life-event suppression block):

1. **Thematic uniqueness** — Each rollup must cover a *distinct* behavioral theme. Never emit two rollups describing the same underlying life pattern under different names. Examples of forbidden pairs:
   - "Aspiring Homeowner" + "New Home Transition"
   - "College Bound" + "Education Investor"
   - "New Parent" + "Baby Prep"
   - "Frequent Traveler" + "Vacation Planner"
   
   Pick the single best label and combine the categories under it.

2. **Life events always win** (explicit reinforcement) — When a behavioral pattern thematically overlaps with a detected life event, **drop the behavioral rollup entirely**. Life events carry richer context (funding, timing, products) and are surfaced separately. Never try to "complement" a life event with a parallel behavioral rollup on the same theme.

Also tighten the `pillar_rollups` tool schema description: add "Each rollup must describe a distinct behavioral theme. If a theme is already covered by a detected life event, omit the behavioral rollup entirely — life events take priority."

## Expected result
- "Aspiring Homeowner" + "New Home Transition" collapses to just the life event (or just one rollup if no life event exists).
- Same for education, parenting, travel, retirement themes.
- Spending Patterns section shows only distinct, non-overlapping behavioral habits.

## Out of scope
- UI changes, downstream edge functions, life-event detection logic.

