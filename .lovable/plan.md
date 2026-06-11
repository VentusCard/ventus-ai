# Microsegment cards on Automated Flows

Replace the vertical signal list inside an expanded flow on `/bankdemo` Automated Flows with a horizontal grid of microsegment cards — one per signal — each carrying its own AI-generated campaign title, copy, and CTA.

## UX

When a row in `ProductAutomatedFlowsView` is expanded:

- Replace the current `<ul>` of signals with a CSS auto-fit grid (`grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3`) of microsegment cards, one per `flow.signals[i]`.
- On expand, fire a single edge-function call that returns N microsegments (one per signal). While loading, render N skeleton cards. On error, show inline retry.
- Results are cached per `flow.id` in component state so re-expanding is instant. A small "Regenerate" icon button in the section header re-runs the call.

### Card anatomy (top → bottom)

1. **Signal header** — existing type badge (Life Event / Behavioral), signal label, evidence (smaller, muted).
2. **Microsegment title + audience** — 4–7 word archetype label, plus estimated sub-audience size (flow audience split proportionally across signals, formatted with existing `formatAudience`).
3. **Campaign copy** — subject line (≤60 chars, semibold) + 2–3 sentence body.
4. **CTA** — outline button, 3–5 words, non-functional (demo).

Cards use the existing light theme tokens (`border-slate-200`, `bg-white`, slate text scale). No dark mode utilities.

## Data + edge function

New edge function `generate-flow-microsegments`:

- Input: `{ productName, productCategory, productPositioning, signals: [{ label, evidence, type }] }`.
- Calls Lovable AI Gateway (`google/gemini-3-flash-preview`) with a `tool_choice` structured-output tool `emit_microsegments` returning `{ microsegments: [{ signalLabel, title, subject, body, cta }] }` — one entry per input signal, matched by `signalLabel`.
- System prompt reuses existing project rules: no em dashes, no exact dollar amounts or transaction counts, no risk/stress framing, vaguely specific behavioral phrasing, 4–7 word archetype titles, ≤60 char subjects, 2–3 sentence bodies, 3–5 word CTAs. Mirrors the conventions already in `generate-campaign-segment/index.ts`.
- CORS + 429/402 handling identical to existing functions.

Client calls it via `supabase.functions.invoke("generate-flow-microsegments", { body: ... })` from `ProductAutomatedFlowsView`.

## Technical details

- File edits:
  - `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx` — replace the expanded `<ul>` with a `<MicrosegmentGrid>` subcomponent; add per-flow state map `Record<flowId, { status, items?, error? }>`; trigger fetch on first expand; add header "Regenerate" button when results exist.
  - New file `supabase/functions/generate-flow-microsegments/index.ts` — structured-output edge function described above.
- Sub-audience math: `Math.round(flow.estimatedAudience / flow.signals.length)` for an even split (kept simple; no extra data needed).
- Loading state: render `flow.signals.length` skeleton cards (signal header visible, copy area uses `animate-pulse` slate blocks) so layout doesn't jump.
- Error state: small inline alert inside the expanded area with a Retry button calling the same fetch.
- No changes to `productAutomatedFlows.ts` schema, the filter chips, the row summary, or any other view.
