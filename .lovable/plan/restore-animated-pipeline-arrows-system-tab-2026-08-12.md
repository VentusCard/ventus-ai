# Restore animated pipeline arrows (System tab)

The two connector arrows between Data sources → Ventus core → Activation destinations are currently static dashed lines. Restore the motion so the diagram reads as live data flow.

## What it will look like
- The dashed line "marches" continuously toward the arrowhead (left-to-right on desktop, top-to-bottom when the board stacks on narrow screens).
- A small pulse dot travels along the line and fades out at the arrowhead, repeating on a loop.
- The second connector keeps its amber tint, the first keeps slate; the arrowhead subtly brightens as each pulse arrives.
- Motion is disabled for users with reduced-motion preference.

## Technical notes
- Edit `Connector` in `src/components/tepilot/insights/CapabilitiesView.tsx`.
- Add a `flow-dash` keyframe (animating `stroke-dashoffset`) and a `flow-pulse` keyframe to `tailwind.config.ts`, applied to the dashed `path` and to a small traveling `circle`/`rect` inside the same SVG.
- Keep the existing 52x20 viewBox and the `max-lg:rotate-90` behavior so the stacked layout inherits the animation.
- Wrap animation utilities with `motion-reduce:animate-none`.
