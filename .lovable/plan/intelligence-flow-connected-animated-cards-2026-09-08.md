# Intelligence flow: connected, animated cards

Refine the Intelligence section's context plane so the four cards read as one continuous, intelligent flow.

## Changes

1. **Even card heights** — the two middle cards (behavioral enrichment, external intelligence) currently stretch to match the taller outer cards. Give all four cards a shared, shorter fixed height so the row is balanced, with the outer cards' content tightened (smaller source rows, pills wrapping in two lines).

2. **Connecting lines** — add three horizontal connectors between the cards, drawn as thin lines centered vertically across the gaps. Each connector is dim by default and lights up blue once the stage it feeds has been reached.

3. **Flow animation** — each active connector carries a small travelling pulse (a glowing dot / gradient sweep moving left to right, looping) to signal continuous flow. The final connector into the holistic card fades from blue to emerald to match that card's accent. Active cards get a soft breathing glow.

4. **Mobile** — on small screens the grid stacks two-up; connectors are hidden there to avoid awkward geometry.

## Technical notes

- All edits in `src/components/IntelligenceSection.tsx` plus one keyframe (`flow-pulse`) added to `src/styles/animations.css`.
- Connectors are absolutely positioned within the existing relative grid container, so the scroll-pinned track, stage state, and click navigation are unchanged.
- Respects `prefers-reduced-motion` by disabling the travelling pulse.
