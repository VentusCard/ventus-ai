# Editable Coworker Playbooks

Make every field in the Persona Settings sub-tab editable in-session, so a banker can author the coworker's playbook live in the demo rather than only toggling it.

## What becomes editable

Per selected coworker:

- **Mission** — click the paragraph to edit it inline (multi-line).
- **Always does / Sometimes does** — each row's text is editable inline; "Sometimes" rows also expose an editable `When:` trigger. Rows keep their on/off toggle.
- **Never does** — text editable, but rows stay visually locked-styled and non-toggleable (they are constraints, not switches). A small "Governed" tag stays on each row.
- **Add / remove rows** — each of the three groups gets an "+ Add rule" row at the bottom and a hover-revealed remove (x) on each row.
- **Signals it watches** — pills become multi-select chips over the five signal families; click to include/exclude.
- **Tone & length** — Tone, Word cap, Disclaimer become editable fields (tone and word cap as selects with sensible presets plus free text; disclaimer as text).
- **Escalation** — editable text.
- **Delivery footer** — send window, frequency, reply SLA become editable inline fields.

## Interaction model

- Click a value to edit; blur or Enter commits, Escape cancels. Text areas commit on blur.
- Edits are session-only React state keyed by coworker id, layered over the authored defaults from `coworkerPersonaData.ts` — no backend writes, no LLM calls (consistent with /bankdemo being LLM-free).
- Switching coworkers preserves each coworker's edits for the session.
- A "Reset to default" button next to "Save playbook" restores the authored playbook for the current coworker.
- "Save playbook" keeps its confirmation toast.
- Empty text on blur reverts to the previous value (no blank rules).

## Layout

Unchanged two-column layout. Editable fields render as plain text until hovered (subtle slate-50 hover surface + pencil affordance), then as a bordered input on focus — so the panel still reads as a document, not a form. Strict light theme, no `dark:` utilities.

## Technical notes

- New local state in `CoworkerPersonaSettingsView.tsx`: `drafts: Record<string, Playbook>` seeded lazily from `COWORKER_PLAYBOOKS[id]` on first edit; a `getPlaybook(id)` helper returns the draft when present.
- Small internal `EditableText` component (single-line and multiline variants) in the same file, handling click-to-edit, commit/cancel, and empty-revert.
- `PlaybookRule` gains no schema change; new rows get an id of `${teamId}-${group}-${crypto.randomUUID().slice(0,8)}`.
- `RuleGroup` gains `onEditText`, `onEditWhen`, `onAdd`, `onRemove` props; the `locked` branch keeps its styling but allows text editing.
- No changes to `coworkerPersonaData.ts` content, `BankwideWMCopilotView.tsx`, or any other view.
