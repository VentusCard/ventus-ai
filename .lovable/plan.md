# Smoother Hero Panel Reveal & Output-Card Buffer

## Goal
Make the homepage hero feel more polished when the Orchestrate stage begins: the dark transaction card should glide left as the panel enters, and the first output cards should wait a brief beat before appearing.

## What we'll change
1. **Smooth leftward slide of the dark card** in `src/components/ScrollDrivenHero.tsx`:
   - Replace the abrupt conditional mount of the right panel with a width/margin transition.
   - When not in stage 4, the panel collapses to `width: 0` and `margin: 0`; in stage 4 it expands to `width: 220px` with a left margin.
   - Add `transition-all duration-500 ease-out` so the flex container grows smoothly and the dark card naturally drifts left.

2. **Buffer before output cards animate**:
   - Introduce a small delay (≈0.25–0.35 s) after stage 4 begins before `personaWindowProgress` starts driving the staggered output cards.
   - This gives the panel time to settle on the right before cards begin sliding in.

3. **Preserve existing behavior**:
   - Keep the panel only visible in stage 4.
   - Keep the persona cycling, card stagger, and connector animations intact.
   - Keep the stage indicator removed.

4. **Verify** with `bun run build` and Playwright screenshots at the exact moment stage 4 starts, mid-stage, and fully scrolled.

## Out of scope
- No changes to scroll stages, persona data, mobile layout, copy, or the dark card content.
