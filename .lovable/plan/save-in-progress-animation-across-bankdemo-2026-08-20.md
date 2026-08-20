# Save-in-progress animation across /bankdemo

Every time an edit is saved anywhere in the bank demo, the UI plays a short AI-style processing sequence before showing the new value. Edits stay session-only: reloading /bankdemo returns every field to its original description.

## What it feels like

Pressing Save swaps the button (or the edited row) into a processing state that steps through short staged lines over roughly 2.5 seconds:

```text
[spinner] Applying changes...
[spinner] Recomputing audience...
[spinner] Syncing to activation destinations...
[check]   Synced - 2.4s
```

The stage wording adapts to context:
- Signal / audience edits: applying signal -> recomputing audience -> syncing
- Playbook / persona edits: validating guardrails -> updating coworker playbook -> synced
- Content edits (perks, achievements, campaign copy): applying edit -> regenerating preview -> synced

While the sequence runs, the affected card dims slightly and its inputs are disabled, so it reads as real work rather than a toast. The success line holds about a second, then fades out and the updated content appears.

## Where it applies

All save actions inside /bankdemo, including:
- AI Coworker persona playbook (Save playbook, rule add/edit/remove, signal chips)
- Rewards and Perks / Location experience manager
- Gamification and achievement editors
- Campaign Builder and Segment Builder saves
- Governance and targeting guardrail changes
- Settings-tab edits

Note: the Automated Flows signal editor (inline edit + add signal) is not present in the current code, so there is nothing there to hook into yet. If that editor is restored, it uses the same shared component with no extra work.

## Reload behavior

Unchanged and confirmed intentional: all edits live in session state only, so a page load resets every description back to its original copy. The demo always starts clean.

## Technical notes

- New `src/hooks/useSaveSequence.ts`: takes a stage list plus the commit callback, returns `{ status, stageLabel, run }`. It fires the commit immediately (so state is correct), then advances through stages on timers and settles into `done` before resetting to `idle`.
- New `src/components/tepilot/common/SaveSequence.tsx`: presentational spinner + stage text + check, with `inline` (button-sized) and `block` (row/card banner) variants. Light theme only, existing semantic tokens, no dark utilities.
- Stage presets exported from the component file (`SIGNAL_STAGES`, `PLAYBOOK_STAGES`, `CONTENT_STAGES`) so surfaces stay consistent.
- Each save site replaces its direct `toast.success(...)` call with `run()`; the toast is kept only for saves inside a dialog that closes immediately.
- Timings: about 700ms per stage, 900ms success hold, capped near 2.5s total. Respects `prefers-reduced-motion` by collapsing to a single "Saved" state.
