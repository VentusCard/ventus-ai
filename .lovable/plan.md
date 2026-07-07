## Goal
Extend the Leadership ↔ Ventus AI thread with the same "two distinct tasks + wrap-up takeaway" structure the Advisor thread uses — but reframed for an executive (Priya, Head of Wealth) so it showcases Ventus at leadership scope, not advisor scope.

## Today
The Leadership thread is one deep-dive: pre-retiree product gap → cohort scoping → campaign brief + advisor-comms note + scheduling. That's effectively Task 1.

## Add 4 messages to `REPLY_MESSAGES` in `LeadershipNotificationsView.tsx`

### Task 2 — Board update data pull (new topic)
- **Leader, 9:47 AM** — "Different topic. I'm presenting to the board Thursday on the wallet-share loss in the tech corridor. Give me a one-slide read — size the outflow, tell me where it's actually going, and what we'd propose doing about it."
- **Ventus, 9:48 AM** — executive one-slide read:
  - Size & velocity: ~780 households, ~$1.2B outbound over 2 quarters, ~14% QoQ acceleration.
  - Where it's going: small table (Destination type / % of flow / trend) — brokerage-first neobanks 46%, self-directed platforms 31%, alt-asset apps 15%, other 8%. Generic labels only (no competitor names, per project rules).
  - Who's leaking: 33 advisor books, 60% under 45, avg tenure 4.2 yrs.
  - Proposed response (3 bullets): fee-review pilot for top-decile leakers, self-directed-lite product surface in-app, advisor-led 1:1 outreach for top 120 households by quarter-end.
  - Closer: "Want me to package this as a board-ready one-pager and pre-brief your CoS?"

### Task 3 — Wrap-up to-do list (mirrors Advisor Task 3)
- **Leader, 10:11 AM** — "Before my 1:1s, summarize today's to-do list across both tasks — the pre-retiree cohort and the board prep. Keep it tight, no detail."
- **Ventus, 10:12 AM** — two-section digest, same visual pattern as Advisor:
  - `Task 1 — Pre-retiree structured income`: working session Thu 2pm PT with Chen/Ortiz/Whitfield, per-book prep sheets Wed AM, exec review item logged with nested framing.
  - `Task 2 — Board deck: wallet-share outflow`: one-pager drafted for Thursday, CoS pre-brief scheduled, fee-review pilot shortlist (33 books), 120-household outreach list queued for advisor assignment.
  - Closer: "All logged. Monday rollup will cover both."

## Technical notes
- Only `REPLY_MESSAGES` is extended; pill nav, header counter, and `total` derive from `REPLY_MESSAGES.length` and update automatically.
- No new state, no new data files, no styling changes. `navLabel` uses HH:MM like existing entries. Sender alternates leader/ventus as in the current thread.
- Advisor thread is untouched.

## Compliance / tone
- No named competitors — outflow destinations described by category only (project memory: Competitor References).
- Executive tone: quantified, no jargon, framed as strategic implications, matches existing Leadership voice.
- "Vaguely specific" numbers consistent with project narrative rules — round figures, no false precision on individual clients.

## Files
- `src/components/tepilot/advisor-console/LeadershipNotificationsView.tsx` — append 4 entries to `REPLY_MESSAGES`.
