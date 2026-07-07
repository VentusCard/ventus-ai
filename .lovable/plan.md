
Replace the car-loan campaign task in `AdvisorNotificationsView.tsx` with a premium travel card candidate task. Only the second exchange (Morgan ask → Ventus reply) changes. Wrap-up messages (10:07/10:08) continue to render Task 2 from the same cohort variable, so they update automatically via the data swap.

## Card facts Ventus references
- 60,000 bonus points offer
- 2x points on travel & dining, 1.5x on all other purchases
- Up to $200 combined in Airline Incidental + TSA PreCheck/Global Entry statement credits

## New cohort `travelCardCohort` (8 clients)
Replaces `autoCohort`. Each row:
```
{ name, recentTrip: "Italy" | "Spain" | "Canada" | "Hawaii" | ...,
  tripWindow: string (e.g. "Mar 2026"),
  estSavings: number ($150–$350),
  timing: string }
```
8 believable names spread across Italy, Spain, Canada, Hawaii (+ 1–2 more like Portugal / Japan). Savings framed as "would have earned ~$X back with 2x travel/dining + $200 travel credits on that trip."

## Message updates (second exchange only)
- **Morgan ask:** pull candidates for the new premium travel card launch — recent leisure/international travelers who'd benefit most.
- **Ventus reply:** short intro naming the three card hooks (60k bonus, 2x travel/dining, $200 travel credits), followed by a list of 8 candidates: `name — recent trip (window) · est. $X saved if they'd used the card`.

## Plumbing
- Rename `autoCohort` → `travelCardCohort` with the new shape and update its memo.
- Update the ctx passed into `m.render?.()` from `{ autoCohort, digestRows }` → `{ travelCardCohort, digestRows }` and adjust `MessageDef.render` typing.
- Wrap-up 10:08 Task 2 line becomes `{name} — {recentTrip} · est. $X saved` (still one line per row, no other detail changes).

## Files
- `src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx` only.

## Out of scope
- First exchange (digest / Task 1) content and ordering.
- 9:45 Morgan follow-up phrasing and 10:07 Morgan wrap-up ask — leave as-is beyond any minimal noun swap needed to stay coherent with the new task.
- Any other views, pages, or real data wiring.
