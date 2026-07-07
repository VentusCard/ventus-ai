Pivot the 9:44 / 9:45 exchange in `AdvisorNotificationsView.tsx` to a car-loan cohort request.

## 9:44 Advisor (Morgan)
Short pivot: "Different topic. Marketing is launching a car-loan campaign next month and asked us to seed it from the book. Pull me a working list of clients likely to need auto financing in the next 6 months — name, timing, estimated loan amount, and how confident you are." Update its `quoted` to reference the 9:23 Ventus line.

## 9:45 Ventus (Coworker)
Reply with a compact 6-row list. Each row shows exactly:
- **Client name** (from the `clients` prop, deterministic slice: skip the two clients already in the digest, take the first 6 remaining by id).
- **Timing** — "0–3 mo" or "3–6 mo".
- **Estimated amount** — a rounded range, ~50% higher than a normal cohort: "$33k–$42k", "$68k–$82k", "$27k–$36k", "$90k–$110k", "$42k–$51k", "$48k–$60k".
- **Confidence** — above 50%, realistic spread: "72%", "58%", "81%", "64%", "77%", "69%".

Hand-authored `AUTO_COHORT` array of 6 entries (timing / amount / confidence) indexed by row position; client name comes from the sliced `clients` list.

Layout: one row per client, single line — name (left), then three inline chips/columns (Timing, Est. amount, Confidence) on the right. Match existing message body styling (slate borders, small type). Close with: "Full list is 34 across the book — this is the top 6 by signal strength. Want me to log this cohort as a campaign audience?"

No evidence bullets, no fit label, no product recommendation.

## Note
This uses realistic-percentage confidence (>50%). The digest section still uses the corrected sub-single-digit scale from a previous pass; leaving that alone unless you want it re-aligned.

## Constraints
- Estimated amount stays a rounded range (no precise numbers).
- No em dashes in AI copy.

## Out of scope (flagged)
- 10:07 / 10:08 prep-sheet messages will now read disconnected (still framed around the earlier two-client household prep). Will rewrite into a car-loan continuation on request.
- No changes to digest logic, `EVENT_OFFER`, `EVIDENCE`, later Advisor/Leadership/Inbox surfaces.
