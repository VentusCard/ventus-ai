# Persona Settings for the AI Coworker

Add a fourth sub-tab to the AI Coworker tab in /bankdemo that manages the playbook behind each of the six coworkers, governed as three settings lines: what it always does, what it sometimes does, and what it never does.

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
- Always does — the standing behavior, every cycle. E.g. for Relationship Managers: send the daily signal brief, rank households by decision window, cite transaction evidence for every claim, draft talking points.
- Sometimes does — conditional behavior, each row carrying its trigger. E.g. drafts a nurture email when the advisor asks, escalates to the regional director when a household crosses $2M inbound, follows up when a brief goes unanswered 72h.
- Never does — hard constraints. E.g. never contacts a customer directly, never sends without advisor review, never quotes exact spend amounts or transaction counts, never asserts a life event without corroborating evidence, never uses risk/stress language in customer-facing copy.
- Signals watched — subset of the five signal families.
- Tone & guardrails — vaguely-specific behavioral framing, word cap, required disclaimer.
- Escalation — which team the coworker routes to when a threshold trips.
- Delivery — send window, frequency, reply SLA (pulled from the existing per-destination stats where they exist).

## Interaction

Demo-grade, session-only. "Always does" rows can be toggled off (moving them out of the standing routine); "Sometimes does" rows can be toggled on/off and show their trigger condition inline; "Never does" rows are locked with a governed-by-bank lock icon. Delivery settings are selectable. A "Save playbook" button shows a confirmation toast — no backend writes, no LLM calls (consistent with /bankdemo being LLM-free).

## Technical notes

- New data file `src/components/tepilot/coworker-inbox/coworkerPersonaData.ts` — `COWORKER_PLAYBOOKS: Record<destinationId, Playbook>` keyed to the existing `TEAM_DESTINATIONS` ids (leadership, product-growth, risk, rewards, advisors, marketing) so names/accents/cadence stay in one place.
- New component `src/components/tepilot/coworker-inbox/CoworkerPersonaSettingsView.tsx`.
- Register a `persona` entry in the `ViewMode` union and `toggles` array in `BankwideWMCopilotView.tsx`, rendering the new view.
- Strict light theme, no `dark:` utilities; no changes to existing dashboard, stream, or conversation demos.
