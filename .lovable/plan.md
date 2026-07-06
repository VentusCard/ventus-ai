## Goal

Add a third view on the /bankdemo WM Coworker page — a Leadership ↔ Ventus AI example email thread that mirrors the existing Advisor Conv. Demo in structure and interactivity, but with content aimed at wealth-leadership (enterprise-wide trends, campaign recommendations, retention risk, projected AUM impact — no individual client outreach prep).

## Scope

Presentation-only. No data-model or backend changes. Reuses the same mock-inbox chrome (folder nav, ribbon, subject, sender block, reply thread) as the advisor view.

## Files

1. **New: `src/components/tepilot/advisor-console/LeadershipNotificationsView.tsx`**
   - Structurally a clone of `AdvisorNotificationsView.tsx`: same Outlook-style layout, ribbon, sender header, subject line, thread navigator, and reply chain of alternating Ventus / recipient messages.
   - Recipient becomes a leadership persona:
     - `LEADER = { name: "Priya Raman", email: "priya.raman@bank.com", initials: "PR", title: "Head of Wealth Management, West Region" }`.
   - Ventus sender block unchanged.
   - Initial digest body replaced with a **weekly leadership brief** instead of the daily advisor signal digest:
     - Opening paragraph frames the week at portfolio scale (books covered, households scanned, signals surfaced — reuses the same counts vocabulary as `CoworkerInboxView` capability copy, no exact spend numbers).
     - Three sections keep the Act Now / Opportunities / At Risk skeleton but reframed for leadership:
       - **Act now** — enterprise-wide signals needing a leadership decision this week (e.g. a product-gap alert affecting a cohort, a rising retention-risk pocket in one region, an underused capability across advisor books). Each row: cohort label · timing chip · one-line context · inline supporting numbers ({N} advisors affected · {H} households · {C}% confidence).
       - **Opportunities** — campaign recommendations with projected uplift framed vaguely-specifically (e.g. "Life-event outreach for pre-retirees, mid-book — projected material AUM uplift over the quarter"). Same row shape.
       - **At risk** — cohorts drifting toward attrition or wallet-share loss. Same row shape.
     - Closing paragraph: nothing here needs an immediate decision except Act Now; reply on any row to get the underlying cohort breakdown, advisor list, or a campaign brief.
   - Reply thread (6 messages, alternating) reworked for a leadership conversation:
     1. **Priya** — asks Ventus to unpack the top Act Now item: which advisors, which cohort, what's driving it.
     2. **Ventus** — breaks down the cohort (size, region mix, dominant behavioral signals), calls out the 3 advisor books most exposed, offers to draft a campaign brief or an advisor-comms note.
     3. **Priya** — asks for both, plus a view on the Opportunities row about the pre-retiree cohort.
     4. **Ventus** — delivers a compact campaign brief block (audience, message angle, channels, projected uplift range, timing) and an advisor-comms note block; adds a short read on the pre-retiree opportunity (why now, expected engagement lift, risks).
     5. **Priya** — approves the campaign brief in principle, asks Ventus to schedule a follow-up with the three exposed advisors and log the pre-retiree opportunity for next week's exec review.
     6. **Ventus** — confirms both actions logged, states what it will send to whom and when, offers a weekly rollup for next Monday.
   - Copy guardrails (per project memory):
     - Vaguely specific numbers only — advisor counts, household counts, confidence %, projected-uplift ranges are OK; no exact AUM $ figures or transaction totals.
     - No stress/risk terminology in customer-facing copy — but this is internal leadership copy, so retention-risk / attrition framing is allowed.
     - No competitor names, no backend infrastructure references.
     - Manrope for UI (inherited).

2. **Edit: `src/components/tepilot/insights/BankwideWMCopilotView.tsx`**
   - Extend `ViewMode` type to `"inbox" | "advisor" | "leadership"` (renaming `"notifications"` → `"advisor"` for clarity).
   - Add a third toggle button "Leadership Conv. Demo" alongside "Coworker Dashboard" and "Advisor Conv. Demo", same styling, `Users` (or `Building2`) icon from lucide-react.
   - Render `<LeadershipNotificationsView />` when `viewMode === "leadership"`.
   - No new props needed — leadership view is self-contained (like the advisor view now essentially is post-refactor).

3. **No changes** to `CoworkerInboxView.tsx`, `coworkerInboxData.ts`, `AdvisorNotificationsView.tsx`, or any data files. The existing example-thread cards on the Coworker Dashboard stay as static previews.

## Interactive parity with advisor view

The leadership view keeps the same mock-email interactivity that the advisor view has: navigable message list (click to jump to a message), ribbon buttons that are visual-only, and the full reply thread scrollable in place. No new interaction patterns.

## Out of scope

- No changes to sample data, personas, or the roster in `coworkerInboxData.ts`.
- No new routes; the third view lives inside the existing `/bankdemo` WM Coworker tab.
- No analytics wiring or backend calls.

## Verification

- Confirm the three toggle buttons render and switch correctly.
- Confirm the leadership thread renders with the recipient block, subject, digest body, and 6-message reply chain.
- Confirm no `dark:` utilities and no hardcoded color classes were introduced (strict light theme).
- Confirm build passes.
