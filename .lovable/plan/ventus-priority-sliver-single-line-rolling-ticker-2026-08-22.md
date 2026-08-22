# Ventus priority sliver: single-line rolling ticker

The "3 priorities in your book right now" banner currently stacks a header row plus a 3-chip grid, which makes it roughly twice its original height. Collapse it back to one row and show the priorities one at a time with a rolling animation.

## What changes

- The banner returns to its original single-row height: Ventus avatar, title, and the open-chat arrow on one line.
- Instead of three chips below, one priority "rolls" through the row — headline plus its metric — swapping every ~5 seconds with a vertical roll (current item slides up and fades out, next slides in from below).
- Three small dot indicators on the right show which priority is active; clicking a dot jumps to that priority and pauses rotation briefly.
- Hovering the banner pauses the rotation so the text can be read.
- Clicking the rolling priority opens Ventus chat with that priority's briefing prompt (same behavior the chips have today). Clicking elsewhere on the banner opens the chat with no prompt.
- Respects reduced-motion: with `prefers-reduced-motion`, items still cycle but cross-fade without vertical travel.

## Technical notes

- Edit `src/components/tepilot/insights/VentusAIDashboardView.tsx` (`renderSliver`): replace the `md:grid-cols-3` chip grid with a fixed-height (`h-5`), `overflow-hidden` rotator slot placed inline on the existing header row, next to the title.
- Rotation state: `useState` index + `useEffect` interval (5s), cleared on unmount and skipped while hovered.
- Animation: add a small `ventus-roll-in` / `ventus-roll-out` keyframe pair to `src/styles/animations.css` (same file as `ventus-pulse-halo`), keyed by index so each swap re-triggers.
- Keep existing tokens/palette; no dark-mode utilities.
