# Add a secondary "Learn More" CTA to the homepage hero

## Goal
Give the homepage hero a second, lower-friction CTA alongside "Schedule a Demo" that scrolls visitors into the value-prop section.

## Changes

1. **Anchor the next section**
   - Add `id="problem"` to `src/components/ProblemStatementSection.tsx` on the root `<section>` so the CTA has a scroll target.

2. **Add the secondary CTA in the hero**
   - In `src/components/ScrollDrivenHero.tsx`, place a second button next to the existing "Schedule a Demo" primary button.
   - Label: **"Learn More"**
   - Action: smooth-scroll to `#problem`.
   - Visual treatment: outline/ghost secondary button (`variant="outline"`) with the same height (h-12) so the pair feels like a unified button group, while keeping the filled blue button as the dominant action.

3. **Responsive behavior**
   - On mobile the two buttons stack or wrap naturally within the existing flex layout.
   - Preserve the existing fade/slide entrance animation and transition delay for the new button.

## Out of scope
- No changes to the primary CTA destination or label.
- No changes to the hero scroll-driven animation or the right-side orchestration panel.
