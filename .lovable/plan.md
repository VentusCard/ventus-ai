# Fix the personalization mockup: wide iPad, thin bezel, no dead space

The last pass tied the device width to viewport height (`(100vh - 260px) * 0.52`), which squeezed the frame into a narrow phone shape and left large empty margins on both sides of the card. This plan reverses that and makes the mockup a wide, tablet-proportioned surface that fills its column.

## What changes

1. **Width is driven by the column, not the viewport height**
   Drop the `min(100%, 520px, calc((100vh - 260px) * 0.52))` cap on both mockup wrappers (empty state and selected state). The device fills the full width of its card, with a generous upper bound only so it never looks absurd on ultra-wide screens.

2. **Tablet proportions instead of phone proportions**
   Constrain the frame by aspect ratio (portrait-tablet, ~3:4) rather than a hard pixel width. Height still fits inside the workspace; when the column is wider than the height allows, the frame grows to the height limit and stays centered — but the column widths below make that the common case, not the exception.

3. **Thinner bezel**
   The shared device frame uses a 12px slate border plus a 12px outer pad. For the analytics workspace, that reads as a thick plastic edge. Add an opt-in `compact` frame mode to the device component: 6px border, `rounded-[16px]`, and reduced outer padding. `/deckmo` and the executive demo keep the current chunky frame — only the three personalization tabs pass the compact flag.

4. **Rebalance the workspace columns so the tablet actually has room**
   Current split is `0.9fr / 1.05fr / 1.35fr`. Move to roughly `0.8fr / 0.95fr / 1.75fr` so the personalized-surface card is clearly the dominant panel. The left two columns stay readable (no truncation regressions) because their content is chips and short labels.

5. **Trim the surrounding dead space**
   Reduce the mockup card's body padding, remove the extra centering gutter, and let the frame sit flush inside the card so the visible whitespace around the device is a thin, even margin rather than wide side bands.

## Technical notes

- Files: `src/components/tepilot/insights/CustomerMockupPanel.tsx` (grid template, wrappers, padding) and `src/components/exec-demo/ExecDemoPhoneView.tsx` (new optional `frame?: "default" | "compact"` prop controlling border width, radius, and outer padding — defaults to current behavior so no other caller changes).
- No business logic, data, or generation behavior is touched.

## Verification

Playwright screenshots of all three personalization tabs at 1440px and 1920px, checking: the device reads as a wide tablet, bezel is thin, no side dead bands, and no page-level scrolling.
