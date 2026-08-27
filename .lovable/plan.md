# Narrower mockup section in personalized tabs

## Goal
Make the phone mockup in the three personalized tabs feel like a wide phone rather than a super-wide tablet, reducing the empty horizontal space around it.

## Current state
- `CustomerMockupPanel.tsx` sizes the mockup container with `calc((100vh - 200px) * 0.95)`, producing a near-tablet aspect ratio.
- The surrounding grid allocates `1.75fr` to the mockup column.
- `ExecDemoPhoneView.tsx` already supports `frame="compact"`, which is in use.

## Proposed changes
1. Reduce the mockup width multiplier in `CustomerMockupPanel.tsx` from `0.95` to a phone-proportional value (target ~`0.55`).
2. Rebalance the grid columns so the mockup column is narrower while preserving readability of the left panels (e.g., shift from `0.8fr_0.95fr_1.75fr` to `0.9fr_1.1fr_1.0fr` or similar).
3. Keep the compact frame and internal zoom unchanged so content density stays the same.
4. Verify at 1440px and 1920px viewports that the mockup reads as a wide phone and does not trigger page-level scrolling.

## Files to edit
- `src/components/tepilot/insights/CustomerMockupPanel.tsx`
