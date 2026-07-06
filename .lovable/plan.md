Turn the Notifications tab into an Outlook-style **email thread** where the current "Daily digest — N signals to action" email is the **first message**, followed by an advisor ↔ Ventus AI back-and-forth focused on **understanding the context behind each signal and preparing for the conversations** — not on timing/urgency.

## File
`src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx` — extend, don't replace. Keep the ribbon, subject, sender block, existing digest body, and signature intact. Keep props (`clients`, `onOpenClient`, `onPrepareWithVentus`) unchanged so `BankwideWMCopilotView` still compiles.

## New structure
Inside the white email card, after the current digest body but before the signature, add:

1. **Thread divider** — full-width slate-200 rule + label: `Conversation (6)`.
2. **Five stacked reply cards** in chronological order (message #1 is the existing digest above). Each card:
   - Small avatar (VA blue `#0078D4` for Ventus, slate initials for advisor "MC" — Morgan Chen)
   - Sender name + muted email + right-aligned timestamp (9:22, 9:38, 9:44, 10:02, 10:07)
   - Short quoted strip (`border-l-2 border-slate-200 pl-3 text-xs text-slate-500`) referencing the prior message
   - Body: 2–4 short paragraphs or a tight bulleted list
   - Advisor cards: `bg-slate-50`; Ventus cards: white. Both `border border-slate-200 rounded-md p-4`.

## Conversation beats (context & prep, not timing)

Message 1 = existing digest (unchanged).

Message 2 — **Advisor → Ventus, 9:22 AM**
Advisor asks **client-specific questions by name**, referencing the top two names from the digest (call them `A` and `B` — pulled from data):
- "On **{A}** — what actually changed for them? Last time we spoke it was mostly {generic context}. What's the {A.event label} signal picking up on?"
- "On **{B}** — is this the same {B.event label} thread we flagged last quarter, or something new? And do we know if the spouse is involved in this one?"
- Closes: "Give me the story behind each, not just the headline."

Message 3 — **Ventus → Advisor, 9:38 AM**
Answers both clients by name:
  - **{A}** — 2 bullets: what shifted in the household's behavior pattern (vaguely specific) + what that pattern usually indicates in similar households.
  - **{B}** — confirms new vs. prior thread, notes spouse/joint status, adds one behavioral nuance.
Closes: "Want the fuller household picture for each — who's involved, what's changing around them?"

Message 4 — **Advisor → Ventus, 9:44 AM**
"Yes. Household composition, anything about the spouse or dependents, and whatever context would change how I frame the conversation. I don't want to walk in cold."

Message 5 — **Ventus → Advisor, 10:02 AM**
Per-client mini-brief: name → 3 bullets covering (a) household makeup and joint-account status, (b) the behavioral shift in plain language, (c) one nuance to be careful about (e.g., decision likely shared with spouse, sensitivity around a family event, prior product exposure). Closes: "Want a prep sheet for each — angle, 3 talking points, and a soft intro you can paste?"

Message 6 — **Advisor → Ventus, 10:07 AM**
"Please. Angle, 3 talking points, and a short intro paragraph per client. Log both as follow-ups so I have the prep notes when I pick these up."

## Data usage
Read the top two entries from the existing `grouped.high` `useMemo` (fallback `grouped.opportunity`) to derive real client names + event labels via `LIFE_EVENT_CONFIG[event.eventType].label`. Advisor identity is a local constant (`ADVISOR = { name: "Morgan Chen", email: "morgan.chen@…", initials: "MC" }`). No new external data.

## Copy guardrails
- Follow project memory: "vaguely specific" behavioral phrasing, no exact spend numbers or transaction counts, no risk/stress framing, no competitor or backend-infra references.
- **Do not emphasize timing/urgency.** Frame everything as *understanding* and *preparation*.
- Advisor voice: terse, lowercase-friendly, professional; always references clients by name.
- Ventus voice: concise, structured, ends most messages with a single clear next-step question about context or prep.

## What stays the same
Outlook ribbon, subject header, sender block, existing grouped digest body with Open/Prepare buttons, signature footer, props signature.

No other files change.