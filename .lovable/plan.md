# Reverse rolling signal ticker in Ventus Core

In the System tab's Ventus Core signal sections, the rolling detection ticker currently reads evidence → signal (e.g., "Title + escrow payment → Home purchase in progress"). Flip it so it reads signal → evidence (e.g., "Home purchase in progress → Title + escrow payment").

## What changes

- File: `src/components/tepilot/insights/CapabilitiesView.tsx`
- Target: `SignalSection` component, lines ~494-497
- Swap the rendered order so `e.to` (the signal) appears first and `e.ev` (the supporting evidence) appears after the arrow
- Keep the same styling, animation, basis badge, and click behavior

## Verification

- TypeScript check passes
- Playwright screenshot of `/bankdemo` System tab confirms the ticker now shows signal → evidence
