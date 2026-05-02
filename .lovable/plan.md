## Issue

In the "Personalized Engagement Orchestration" section, each of the two journey cards (Regular Client / Wealth Client) stretches with `flex-1` to fill available height, but each step only contains a small icon + one short label. Result: lots of dead vertical space inside each card, and the steps look like skinny strips of text floating in a tall box.

## Goal

Make the two journey cards feel intentional and dense — content sized to itself, with tighter spacing — rather than empty boxes stretched to fill height.

## Changes (single file: `src/components/exec-demo/NextConversationRationale.tsx`)

1. **Stop force-stretching the cards.**
   - Outer wrapper (line 900): change `flex flex-col gap-1 flex-1 min-h-0` → `flex flex-col gap-2 shrink-0` so the cards size to content instead of stretching.
   - Each `<article>` (lines 903, 978): drop `flex-1 basis-0 min-h-0 ... flex flex-col`; keep just `rounded-xl border border-slate-200 overflow-hidden bg-white`.

2. **Tighten the inner grids** (lines 917, 994):
   - Change `pb-3` → `pb-2.5` and remove `flex-1 min-h-0`.
   - Each step cell (lines 919, 931, 943, 996, 1008, 1020): drop `min-h-0 flex flex-col ... overflow-hidden`; keep `min-w-0 rounded-md border ... px-2 py-1.5`. Remove the extra wrapper flex column since there's only a label + icon row.
   - Reduce step internal padding: `py-1.5` → `py-2` (slightly more breathing room around the single line, since the box is no longer stretched).

3. **CTA button:**
   - Change `h-full` to a fixed `h-9` so it matches the step row height naturally instead of stretching.

4. **Brand strip:**
   - Reduce `h-[6px]` → `h-[4px]` to feel less heavy now that overall card height is shorter.

## Result

Both cards will be compact horizontal strips: brand strip → eyebrow row → single row of 3 steps + CTA, all sized to their content. The "AI Native Intelligence Layer" pills row above gets the freed vertical space naturally (or the panel ends sooner — fine either way since this is the last block).

## Out of scope

- No copy changes.
- No color or icon changes.
- No changes to the AI Native Intelligence Layer rows above.
