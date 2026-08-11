# Redesign the global search bar border

Thicken and sharpen the corners of the Ask Ventus AI omnibox in the `/bankdemo` global header so it clearly reads as a smart-search affordance.

## Scope
- File: `src/components/tepilot/insights/AnalyticsContainer.tsx`
- Target: gradient-bordered omnibox (lines 575–594)
- No functional changes; routing, dropdown, and live-dot behavior stay the same.

## Plan

1. Increase border thickness
   - Replace the `p-[1px]` wrapper with `p-[2px]` so the gradient ring is visible at normal viewing distance.

2. Improve corner visibility
   - Use a larger, consistent outer radius (`rounded-xl`) and a slightly smaller inner radius (`rounded-[11px]` or `rounded-lg`) so the concentric curves are crisp and the gradient does not get clipped by the inner background.

3. Enhance the focus state
   - Replace the current `focus-within:shadow-[...]` with a slightly more prominent indigo/violet glow, optionally paired with a subtle animated gradient shift on focus to signal the AI entry point.

4. Keep existing dimensions and interactions
   - Maintain `w-72 h-8` and the inner input layout (pl-7, live dot, placeholder).
   - Preserve the `border-0` on the input so the gradient wrapper remains the only visible outline.

5. Verify visually
   - Take a Playwright screenshot of the header to confirm the border is visible and corners are rounded cleanly.

## Acceptance
- The omnibox border is noticeably thicker and its corners are clearly rounded.
- The dropdown, live dot, placeholder, and Enter-to-Ask behavior remain unchanged.
- The header layout is not broken.
