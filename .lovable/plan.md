Tighten the Outlook-style email body copy in `AdvisorNotificationsView.tsx` to feel like a real professional digest:

1. **Opening greeting** — Shorten from two sentences to one tight line. e.g. "Morning — {totalSignals} new signals across {clientsWithSignals} clients worth acting on today."
2. **Section headers** — Keep the colored left-border accent, but drop the subtitle line under each section title. Use shorter titles: "Act now", "Opportunities", "At risk".
3. **Signature** — Trim to two lines: sign-off + "Sent by Ventus Copilot · ventusai.com". Remove the "Reply to this thread..." sentence.
4. **Empty state** — Keep the single italic line, but shorten it slightly.

No structural/layout changes. Same props, same handlers, same Outlook ribbon and sender block styling.