# Coworker Dashboard — Team Destination Redesign

Rebuild the "Coworker Dashboard" sub-tab (inside AI Coworker) so it is organized by the banking teams Ventus AI works for, instead of a single advisor roster. Each team gets its own metrics and its own insight lines.

## Teams (destinations)

1. Bank Leadership — enterprise trends, campaign approvals, weekly pulse
2. Product & Growth — product-gap alerts, next-product targeting, uplift briefs
3. Risk & Compliance — vulnerability cohorts, exposure changes, escalations
4. Rewards & Deals — merchant partnerships, redemption lift, offer refreshes
5. Relationship Managers / Advisors — client signal briefs, outreach drafts
6. Marketing / Campaign Ops — segment-of-one briefs, creative routing

Ships with all 8; each card can be collapsed if the row gets long.

## Layout

- Top status strip stays (Active, last activity, week totals) but the copy becomes team-agnostic: emails sent, replies, active threads across all teams.
- KPI row reduced to 4 global numbers: signals surfaced, briefs delivered, teams served, reply latency.
- New primary section: **Team destinations** — one card per team, in a responsive grid.
  Each card shows:
  - Team name + colored accent bar + channel chip (Email / CRM / Digital Banking / Ventus)
  - Big number: briefs or actions delivered this week, plus WoW delta
  - Two secondary stats (e.g. recipients, open/reply rate, pending approvals)
  - 2–3 insight lines — short, concrete, current-week ("14 households qualify for 529-to-Roth; no proactive contact yet")
  - Footer: last delivery time + a small live dot
- Existing "Team status" roster list stays, moved below, retitled "People Ventus works with" — still sampled from ROSTER.
- Capabilities accordion and footer disclaimer stay as-is.

## Technical notes

- Add `TEAM_DESTINATIONS` to `src/components/tepilot/coworker-inbox/coworkerInboxData.ts`: id, name, channel, accent token, weekly count, prevCount, two stats, insight strings, lastDeliveryAgo.
- Rewrite `CoworkerInboxView.tsx` body: keep status strip + capabilities panel, replace the KPI grid contents, add a `TeamDestinationCard` sub-component, keep the roster list below.
- Strict light theme: white cards, `border-slate-200`, no `dark:` utilities. Accent bars use existing per-team hues (indigo, emerald, amber, rose, violet, sky, teal, slate) at 50/200/700 shades; red only for the Risk team's risk-flagged line.
- No backend calls — all values stay static demo data.
