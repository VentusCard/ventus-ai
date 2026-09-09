# Hero Orchestrate Panel & Output Cards Adjustment

## Goal
Tighten the desktop hero animation so the Ventus Orchestrate panel feels anchored to the right side of the visual area and the output cards are narrower.

## What we'll change
1. **Reposition the Orchestrate panel** in `src/components/ScrollDrivenHero.tsx` so it starts further right within the right column, removing the "too centered" look. Keep it to the right of the dark transaction card and maintain the vertical stack.
2. **Make output cards horizontally shorter** by reducing the panel width and card width (target ~220–240 px instead of the current 300 px container).
3. **Preserve animation** — keep the staggered reveal, dashed connector lines, and persona cycling intact; only adjust geometry and alignment.
4. **Verify** with `bun run build` and a Playwright desktop screenshot of the hero at the final Orchestrate stage.

## Out of scope
- No changes to scroll stages, persona data, mobile layout, or copy.
- No changes to the dark transaction card itself.
