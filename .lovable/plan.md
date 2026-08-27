# Plan: richer color and gradient for the Intelligence Database priority sliver

## Goal
Make the Ventus AI priority sliver in `/bankdemo` Intelligence Database feel more colorful and gradient-driven without returning to the heavy dark banner or breaking the strict light theme.

## Current state
- The sliver lives in `src/components/tepilot/insights/VentusAIDashboardView.tsx` inside `renderSliver()`.
- Current styling: `bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50` with a blue-to-indigo icon badge.
- Recent feedback: previous dark version was too heavy, the light version is now too washed out.

## Changes
1. **Saturate the background gradient**: shift from pale blue/slate to a more perceptible hue ramp, e.g. `from-sky-100/90 via-indigo-100/80 to-violet-100/70`, while keeping opacity low enough to stay light-themed.
2. **Add a left accent**: a 3–4px vertical gradient bar (`from-sky-500 via-indigo-500 to-violet-500`) on the left edge to signal "AI intelligence" without darkening the whole card.
3. **Vibrant badge icon**: update the `V` badge gradient to span sky → indigo → violet and increase contrast so it pops against the lighter background.
4. **Hover state**: intensify the gradient slightly on hover (`hover:via-indigo-100 hover:to-violet-100`) and keep the blue-tinted border.
5. **Text remains slate-700/800** for readability; no dark-mode utilities.

## Verification
- Inspect the Intelligence Database "Overview" tab in the preview.
- Confirm the sliver still reads as light/enterprise but has visible color and gradient hue.
- Check that hover, pause, and click-to-chat behavior remain intact.
