# Intelligence Database: Add Smart Color Back to Priorities Card

## Goal
Reintroduce color and a subtle gradient to the priorities chat card so it feels intelligent and branded, without returning to the heavy dark banner.

## Current state
- The card was just softened to `bg-slate-50`, slate text, and a light blue badge.
- Feedback: it now looks too plain and does not signal "smart AI" visually.

## Proposed change
1. Apply a soft, light-toned gradient background that suggests intelligence — e.g. `bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-slate-50` or a very light blue-to-slate wash.
2. Add a faint colored border (`border-blue-200/60`) to give it a subtle glow without high contrast.
3. Keep text readable in slate-700/600 tones.
4. Make the Ventus "V" badge use a soft blue gradient (`from-blue-500 to-indigo-500`) with white text so it pops as the AI marker.
5. Use the indicator dots and hover accent in blue-500 to tie the card together.
6. Preserve the rolling priority animation, hover pause, and click-to-chat behavior.

## Files to edit
- `src/components/tepilot/insights/VentusAIDashboardView.tsx` — restyle the `renderSliver` card.

## Acceptance criteria
- The card has a visible but light gradient hue and a subtle colored border.
- It still feels less visually heavy than the original dark gradient.
- Text remains readable and the interactive behavior is unchanged.
