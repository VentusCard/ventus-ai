# Editing and adding signals in Automated Flows

Today each flow row lists its signals with an on/off switch only. Nothing can be reworded, retargeted, or added — if a banker disagrees with a signal, the only option is to turn it off. This adds two intuitive editing paths without turning the tab into a form-heavy admin screen.

## 1. Inline edit on any signal row

Hovering a signal row reveals a small pencil. Clicking it turns the row itself into an edit state (no modal, no context switch):

- Signal name (single line)
- Evidence line — "what we saw in the data"
- Family pill becomes a 5-way selector (Life event / Behavioral / Financial / Demographic / Risk)
- Strength selector: Strong / Moderate / Light — drives the audience weight, shown as a live audience number that updates while editing
- Save / Cancel, plus "Reset to default" on any signal that has been changed

Edited signals get a small "Edited" marker so it's obvious what deviates from the shipped default.

## 2. "Add signal" through a signal library

A dashed `+ Add signal` row sits at the bottom of the signal list. It opens a searchable picker with two paths:

**Browse the library** — every signal used anywhere across the 76 flows, deduped, grouped by family, searchable, with the evidence line as the subtitle. Signals already on the flow appear checked. This is the fast path: most of the time the banker wants a signal that already exists on another product.

**Write a custom signal** — a compact three-field composer (name, evidence, family + strength). Custom signals are added to the library for the rest of the session so they can be reused on other flows.

Risk filters get the same treatment in their own section, with a pass-rate control ("removes ~X%") instead of a strength control.

## 3. Where the state lives

All edits are session-scoped (same pattern as the other demo tabs) — they survive tab switching inside `/bankdemo` and reset on exit. A per-flow "Reset flow to defaults" appears in the expanded header once any override exists.

## Guardrails kept

- Family caps still apply as guidance, not a hard block: adding beyond 3 per family shows a soft note ("more signals than we'd normally fire on") rather than refusing.
- Risk items stay filters — they can never be added as triggers.
- Audience math stays weight-based, so every add/edit/toggle immediately moves the triggered and qualified numbers already shown on the row.

## Technical notes

- New `src/lib/flowSignalOverrides.ts`: session store of `{ flowId: { edited: Record<signalId, Partial<ExpandedSignal>>, added: ExpandedSignal[], removed: string[], filters: ... } }` with a subscribe hook, mirroring `execDemoSessionStore.ts`.
- `expandFlowSignals` / `expandFlowFilters` in `flowSignalFamilies.ts` gain an override-aware wrapper (`useFlowSignals(flow)`) so the existing cache stays intact and defaults remain pure.
- New `src/lib/flowSignalLibrary.ts`: builds the deduped cross-flow catalog once from the expanded signals of all flows.
- New components under `src/components/tepilot/campaigns/`: `SignalEditRow.tsx` and `AddSignalPicker.tsx` (Command-based searchable list in a popover).
- `ProductAutomatedFlowsView.tsx` swaps `expandFlowSignals` for the override-aware hook and renders the edit/add affordances; no change to the audience formulas.
