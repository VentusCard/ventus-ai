# Key Features reveal — match the signal pills animation

In `/bankdemo` → Personalized Deals, the Key features content should appear only after a customer is selected, using the same reveal animation as the signal pills in the left panel.

## Confirmed current animation (signal pills)

`CustomerSignalPanel.tsx` reveals each signal family group with:

- staggered timers: group `i` becomes visible at `120 * (i + 1)` ms, restarted whenever the selected customer changes
- per-item classes: `transition-all duration-300`, hidden = `opacity-0 translate-y-1`, shown = `opacity-100 translate-y-0`

## Plan

1. In `SurfaceFeaturePanel.tsx`, render the Key features list and Unit Economics content only when a customer is selected; show a quiet empty state (matching the black/empty placeholder style used elsewhere) before selection.
2. Add the identical staggered reveal: a `revealed` counter driven by `setTimeout` at 120ms increments, reset on `customer.id` change, with the same `transition-all duration-300` / `opacity-0 translate-y-1` → `opacity-100 translate-y-0` classes per feature row.
3. Keep the section header (and card frame) always visible so the three-column layout and heights do not shift.
4. Verify in preview: selecting Ricky Alvarez staggers the Key features rows in step with the left-panel signal pills.
