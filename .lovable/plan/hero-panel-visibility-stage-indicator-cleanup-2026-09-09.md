# Hero Panel Visibility & Stage Indicator Cleanup

## Goal
Refine the homepage hero animation so the Orchestrate panel only occupies the right side once it has content, and remove the bottom stage-progress indicator.

## What we'll change
1. **Conditional panel layout** in `src/components/ScrollDrivenHero.tsx`: keep the Orchestrate panel out of the layout flow until stage 4 (when output cards appear). Before stage 4, the dark transaction card should sit centered/comfortable in the right column without being pushed left by an invisible panel.
2. **Remove the stage indicator** — delete the bottom "Raw Stream / Categorize / Detect / Orchestrate" progress bar and labels.
3. **Preserve animation** — keep the persona cycling, staggered output cards, and connector lines; only change when the panel enters the layout and remove the indicator.
4. **Verify** with `bun run build` and Playwright screenshots at the start, middle, and final orchestrate stage.

## Out of scope
- No changes to scroll stages, persona data, mobile layout, copy, or the dark card itself.
