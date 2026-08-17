# Make the iPad Mockup Taller

## Goal
Increase the height of the iPad mockup in `/bankdemo` → **Personalized Deals** so the full in-app experience is visible without feeling cramped.

## Current State
- The mockup lives inside `CustomerMockupPanel.tsx`.
- The two-card workspace is locked to `h-[calc(100vh-230px)] min-h-[560px]`.
- The iPad frame inside `ExecDemoPhoneView.tsx` uses `h-full`, so it can only grow as tall as its parent allows.
- On shorter viewports the mockup is cut off or scaled down, hiding content that should be showcased.

## Proposed Change
1. Reduce the top/bottom chrome consumed by the page header, tab bar, and card headers so the mockup workspace can use more of the viewport.
2. Increase the workspace height from `calc(100vh - 230px)` to a larger value (e.g., `calc(100vh - 180px)` or `calc(100vh - 140px)`) and raise `min-h` accordingly.
3. Keep the two-card side-by-side layout intact; only the vertical real estate changes.
4. Ensure the iPad frame and its inner zoomed content still render correctly at the new height.

## Verification
- Type-check the frontend.
- Use Playwright to navigate to `/bankdemo` → **Personalized Deals** and confirm the iPad mockup is visibly taller and no content is clipped unexpectedly.

## Files to Edit
- `src/components/tepilot/insights/CustomerMockupPanel.tsx` — adjust workspace height and min-height.
- Optionally `src/components/exec-demo/ExecDemoPhoneView.tsx` — remove or tune any inner max-height/overflow constraints if they prevent the mockup from filling the new space.
