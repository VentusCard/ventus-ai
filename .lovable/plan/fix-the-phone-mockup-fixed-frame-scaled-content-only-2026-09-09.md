# Fix the phone mockup: fixed frame, scaled content only

## Problem

Right now the whole phone screen — status bar, content, and the bottom nav buttons — is drawn on one fixed 360 x 640 canvas that gets shrunk to fit. So at different window sizes and zoom levels the frame stops filling its space, the bottom buttons shrink or float, and gaps appear.

## What changes

- The phone frame keeps its size and always fills the space it is given (the 9:16 slot in the middle column). It never resizes based on content.
- The top status strip and the four bottom nav buttons (Budget, Rewards, Membership, AI) are part of the frame: full width, fixed size, always pinned to the top and bottom edges. They are never scaled.
- Only the middle content area is scaled. Content is authored at a 360px-wide layout and scaled by width alone to match the content area, so proportions stay identical at any zoom. If it is taller than the area, it scrolls as a phone would — it is never squeezed or letterboxed.
- No other visual changes to any of the three personalization surfaces.

## Technical notes

- `src/components/exec-demo/ExecDemoPhoneView.tsx`
  - Move the status bar and bottom tab bar out of the scaled canvas so they are direct flex children of the frame, at natural size, `shrink-0`.
  - Wrap only the content region in the measured scale container: `scale = box.width / 360` (width-only, drop the height term and `DESIGN_HEIGHT` clamp).
  - Scaled canvas: `width: 360`, `transformOrigin: "top left"`, `transform: scale(s)`, wrapped in a relatively positioned element whose height is `contentHeight * s` when the content is taller, with `overflow-y: auto` on the outer measured box.
  - Keep the compact vs default bezel variants and the WM CoPilot mode (which hides the tab bar) unchanged.
- `src/components/tepilot/insights/CustomerMockupPanel.tsx`: keep the current `min(100%, 360px, 56.25cqh)` 9:16 slot — the frame already fills it; no change expected, verify only.

## Verification

Build, then screenshot all three personalization tabs at 90% and 100% zoom at 1280 / 1528 / 1920 widths and confirm the frame and bottom nav are identical in every case.
