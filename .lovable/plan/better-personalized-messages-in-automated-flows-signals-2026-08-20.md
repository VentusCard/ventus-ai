# Better personalized messages in Automated Flows signals

## Problem

Inside each Automated Flow, only the 2-3 authored signals have real copy (`FLOW_MICROSEGMENTS`). Every supplemental signal falls back to `FAMILY_ANGLE` in `src/lib/flowSignalFamilies.ts` — five generic templates reused across all products. Result: "Your numbers are ready for this" appears identically under dozens of financial signals, with no product benefit, no number, and no reference to the actual behavior that fired.

## What changes

Each signal's message becomes specific on three axes: the behavior that fired it, the product's concrete benefits, and the next step.

1. **Product benefit facts** — a new `src/lib/productFlowBenefits.ts` maps each product flow to 3 short, concrete benefit lines (rate/terms/feature framing, e.g. HELOC: "Draw only what you use", "Rate locked on any draw", "No closing costs under $250K"), plus a one-line proof stat and a differentiated CTA verb. Written per product, no dollar promises the demo can't back up.

2. **Signal-archetype copy** — replace the five family templates with an archetype keyed builder. Each supplemental signal seed (payroll, competitor outflow, research intent, cash hoarding, life-event cluster, tenure/demographic, clean-history, etc.) gets its own opening line that names the observed behavior in "vaguely specific" terms — no counts, no exact amounts — then pairs it with the product's benefits. A signal + product combination produces a distinct subject, body, and CTA.

3. **Body structure** — every generated message follows the same shape used elsewhere in the demo: one line acknowledging the pattern, one line on what the product does for that specific situation, one benefit callout, one clear action. Kept short enough for the inline panel.

4. **Detail panel** — `SignalDetail` in `ProductAutomatedFlowsView.tsx` gains a compact "What they get" benefit list (3 bullets) beneath the message body, and shows the channel-appropriate variant label. Authored microsegment copy still wins when present, but also picks up the benefit bullets.

## Files

- `src/lib/productFlowBenefits.ts` (new) — per-product benefits, proof line, CTA verb.
- `src/lib/flowSignalFamilies.ts` — archetype-based message builder replacing `FAMILY_ANGLE`; seeds tagged with an archetype key; `ExpandedSignal.message` gains `benefits: string[]`.
- `src/lib/productMicrosegments.ts` — unchanged; authored copy still takes priority.
- `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx` — render benefit bullets in the expanded signal detail.

## Guardrails

- Strict light theme, no `dark:` classes; layout density unchanged.
- No transaction counts or exact spend amounts in copy; behavioral labels stay "vaguely specific".
- Opportunity framing, no stress/risk language in customer-facing copy.
- All mock data — no edge functions or AI calls added.
