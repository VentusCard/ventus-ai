Rewrite the 10:07 / 10:08 messages in `AdvisorNotificationsView.tsx` so Ventus's closing summary lists the full client set from both tasks.

## 10:07 Advisor (Morgan)
"Before I sign off, summarize today's to-do list from both tasks — the full digest and the car-loan cohort. Keep it tight, no detail."

Update `quoted` to reference the 9:45 Ventus car-loan reply.

## 10:08 Ventus (Coworker)
Two sections, one line per client, no extra detail:

**Task 1 — Digest signals (N)**
Iterate all rows across the digest (Act Now, Opportunities, At Risk after the one-per-client dedup):
- {client name} — {LIFE_EVENT_CONFIG[event.eventType].label} · {section label}
  where section label = "Act Now" | "Opportunity" | "At Risk".

**Task 2 — Car-loan campaign cohort (6)**
Iterate `autoCohort`:
- {row.name} — {row.timing}

Close: "All logged."

## Plumbing
Extend the render ctx with a new field `digestRows: Array<{ name: string; eventLabel: string; sectionLabel: string }>`, built at the call site by flattening `grouped.high` / `grouped.opportunity` / `grouped.risk` in that order.

## Files
- `src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx` only.

## Out of scope
- Digest section captions / order, sender identity, offers, evidence, and messages 9:22 – 9:45.
