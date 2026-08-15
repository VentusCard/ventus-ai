# Persona Settings for the AI Coworker

Add a fourth sub-tab to the AI Coworker tab in /bankdemo that manages the playbook behind each of the six coworkers — who it serves, what it does, and explicitly what it will never do.

## Where it goes

The AI Coworker tab today has: Coworker Dashboard · Live Work Stream · Advisor Conv. Demo · Leadership Conv. Demo.

New sub-tab **Persona Settings**, placed second (right after Coworker Dashboard), since it governs everything the other views show.

## Layout

Two-column workspace, matching the existing light enterprise style (white cards, slate-200 borders):

```text
┌ Coworkers ─────────┐┌ Playbook: Coworker for Relationship Managers ───────┐
│ ● Bank Leadership  ││ Identity     name · audience · email type · cadence │
│ ● Product & Growth ││ Mission      one-paragraph charter                  │
│ ● Risk & Compliance││ Always does     3-5 rows (green, toggleable)        │
│ ● Rewards & Deals  ││ Sometimes does  3-5 rows (amber, condition per row) │
│                    ││ Never does      3-5 rows (red, locked)              │
│ ▸ Relationship Mgrs││ Signals it watches  pill row (life event, financial,│
│ ● Marketing / Ops  ││              behavioral, demographic, risk)          │
│                    ││ Tone & length    tone select · word cap · disclaimer│
│                    ││ Escalation       who gets looped in, when           │
└────────────────────┘└ Delivery: send window · frequency · reply SLA ──────┘
```

Left rail reuses the existing accent colors per destination. Right panel is scrollable.

## Playbook content per coworker

Each of the six gets authored content covering:
- Mission — one sentence charter, in bank language.
- Does — e.g. for Relationship Managers: surface client life events with transaction evidence, rank households by decision window, draft talking points, follow up on unanswered briefs.
- Doesn't — e.g. never contacts a customer directly, never sends without advisor review, never quotes exact spend amounts or transaction counts, never asserts a life event without corroborating evidence, never uses risk/stress language in customer-facing copy.
- Signals watched — subset of the five signal families.
- Tone & guardrails — vaguely-specific behavioral framing, word cap, required disclaimer.
- Escalation — which team the coworker routes to when a threshold trips.
- Delivery — send window, frequency, reply SLA (pulled from the existing per-destination stats where they exist).

## Interaction

Demo-grade, session-only: "does" rows and delivery settings are toggleable/selectable and persist in component state for the session; "never does" rows are locked with a governed-by-bank lock icon. A "Save playbook" button shows a confirmation toast — no backend writes, no LLM calls (consistent with /bankdemo being LLM-free).

## Technical notes

- New data file `src/components/tepilot/coworker-inbox/coworkerPersonaData.ts` — `COWORKER_PLAYBOOKS: Record<destinationId, Playbook>` keyed to the existing `TEAM_DESTINATIONS` ids (leadership, product-growth, risk, rewards, advisors, marketing) so names/accents/cadence stay in one place.
- New component `src/components/tepilot/coworker-inbox/CoworkerPersonaSettingsView.tsx`.
- Register a `persona` entry in the `ViewMode` union and `toggles` array in `BankwideWMCopilotView.tsx`, rendering the new view.
- Strict light theme, no `dark:` utilities; no changes to existing dashboard, stream, or conversation demos.
