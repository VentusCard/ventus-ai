# AI Coworker — Live Work Stream tab

Turn "What Ventus AI Coworker is working on" from a small panel inside the Coworker Dashboard into its own first-class sub-tab that reads as a continuously rolling live feed of what the coworker is sending and who it is collaborating with.

## Sub-tab structure (AI Coworker tab)

```text
Live Work Stream  |  Coworker Dashboard  |  Advisor Conv. Demo  |  Leadership Conv. Demo
```

"Live Work Stream" becomes the default sub-tab. The activity-feed card is removed from the Coworker Dashboard so it lives in one place only; the dashboard keeps status strip, capabilities, KPIs and Team status.

## What the Live Work Stream shows

- **Live header bar**: pulsing green "Streaming" dot, count of actions today, running counters for emails sent / replies received / signals surfaced that tick up as new entries arrive, and a Pause/Resume control.
- **Rolling stream**: new entries appear at the top every 2.5–5s with a brief highlight-in animation, older entries scroll down; the list caps at ~60 entries. Relative timestamps age live ("just now" → "42 sec ago" → "3 min ago"). Pausing freezes insertion so a viewer can read.
- **Entry format**: colored kind badge (Advisor / Leadership / Signal / Reply / Hand-off), the action sentence, the collaborator's avatar + name and role chip, and a one-line detail (e.g. household, product, projected value). Sending vs receiving is visually distinguished with a direction arrow (outbound to a person, inbound reply from a person).
- **Filter chips**: All / Sending / Replies / Signals / Hand-offs, plus a per-person filter from the roster.
- **Right rail — Collaborators now**: live list of advisors and leaders currently in a thread with the coworker, each with active thread count and "last exchange" time, updating as the stream emits entries touching them.
- Footer keeps the "illustrative demo" disclaimer.

## Technical notes

- New data module `src/components/tepilot/coworker-inbox/coworkerStreamData.ts`: a pool of ~40 templated action entries (kind, verb, collaborator id, detail line) built from the existing `ROSTER`, plus a deterministic generator that composes new entries from the pool so the stream never repeats verbatim in a short window. No LLM calls — consistent with `/bankdemo` making zero LLM calls.
- New component `src/components/tepilot/coworker-inbox/CoworkerLiveStreamView.tsx` owning the interval-driven stream state, pause control, filters, and the collaborators rail. Interval cleared on unmount.
- `BankwideWMCopilotView.tsx`: add `stream` to the `ViewMode` union, set it as the initial mode, add the toggle button, render the new view.
- `CoworkerInboxView.tsx`: remove the "What Ventus AI Coworker is working on" card and let the Team status panel span the row.
- Styling follows the existing strict light theme (white cards, slate-200 borders, existing `KIND_STYLES` colors), with two added kinds for hand-off and outbound/inbound direction.
