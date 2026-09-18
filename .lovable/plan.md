# Rebalance spacing and sizing on the Thesis slide

The opening slide currently sits low on the screen: a large empty band above the headline, then the two headline lines and the Today / With Ventus comparison crowded together near the bottom. The fix is spacing and sizing only — no copy changes, no new elements.

## What changes

1. **Vertical balance** — the block is centered in the slide as a whole, so the empty space above and below is even instead of all at the top.
2. **Headline pair** — the two opening lines stay large but sit closer together as one statement, with a clear, deliberate gap before the comparison block.
3. **Comparison block** — more breathing room between the Today group and the With Ventus group, and more space between each label and its equation line, so each reads as its own idea rather than four stacked lines.
4. **Line sizing** — the equation lines get a slightly larger, more even size so they hold their own against the headline, while still fitting on one line at every supported width.
5. **Side margins** — the content uses the same wide canvas as the rest of the deck so the equations sit comfortably rather than running to the right edge.

## Technical notes

- File: `src/components/deckmo/DeckmoDeck.tsx`, `Opener` component only.
- Container: keep `flex h-full ... justify-center`, widen to the deck's shared `max-w-[1560px]`, horizontal padding to `px-[clamp(32px,4vw,72px)]`, and add compact-height handling via `[@media(max-height:800px)]`.
- Replace the uniform `space-y-8` with explicit gaps: tight gap between line 0 and line 1, larger `mt-[clamp(40px,5vh,72px)]` before the comparison grid.
- Comparison grid: add `gap-y` between the two row groups (extra top margin on the second label row), `mt-2` between label and its equation, `gap-x-[clamp(14px,1.6vw,28px)]`.
- Equation type: `text-[clamp(18px,1.7vw,30px)]`; labels stay `text-[13px]` uppercase.
- Keep the shared grid columns so the three `=` signs remain pixel-aligned, keep reveal steps and the blue Ventus styling untouched.

## Verification

Playwright at 1024x768, 1389x855, 1440x900 and 1920x1080: confirm no horizontal overflow, equations still on one line, `=` x-positions identical between rows, vertical whitespace above and below the block roughly balanced, no page errors.
