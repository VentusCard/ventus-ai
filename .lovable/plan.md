## Scope

Reframe the existing **WM Copilot** as **WM Coworker** — a Ventus AI teammate that communicates by email with the wealth team. The demo shows a static, fully navigable inbox with example threads (Ventus → recipient → Ventus reply → recipient) so the bank-demo user can click through and understand the co-worker model.

This supersedes the earlier "Wealth & Relationship / Advisor + Leadership" merge plan. Nav stays as **WM Coworker** in the same slot the current WM Copilot occupies. The prior merge with Wealth Intelligence is dropped from this pass.

## What ships

### 1. Rename in nav + headers
- `AnalyticsContainer.tsx` sidebar entry: `WM Copilot` → `WM Coworker`.
- `BankwideWMCopilotView.tsx` `TabHeader`: title `WM Coworker`, subtitle updated to describe the email-based AI teammate, howItWorks/whyItMatters rewritten around the coworker/email model.
- No route value changes needed (internal key `wm-copilot` stays).

### 2. New top-level view mode: "Coworker Inbox"
Add a fourth toggle to the existing pill group in `BankwideWMCopilotView.tsx`:
`Dashboard | Client View | Notifications | Coworker Inbox` (new, default landing).

Existing three modes are untouched.

### 3. Coworker Inbox UI (new components)
Three-pane static email client, all mock data, all in-app:

```
┌─────────────┬──────────────────────────┬────────────────────────┐
│ Folders     │ Thread list              │ Thread detail          │
│ • Advisors  │ Ventus → Sarah Chen …    │ Subject line           │
│ • Leadership│ Ventus → Marco …         │ ─────────────          │
│ • All       │ Ventus → Priya …         │ [Ventus] initial email │
│             │                          │ [Advisor] reply        │
│ Roster      │                          │ [Ventus] follow-up     │
│ (avatars)   │                          │ [Advisor] reply        │
└─────────────┴──────────────────────────┴────────────────────────┘
```

New files under `src/components/tepilot/coworker-inbox/`:
- `CoworkerInboxView.tsx` — layout shell + folder/roster state.
- `ThreadList.tsx` — list of threads for the selected folder.
- `ThreadDetail.tsx` — renders a thread's messages with Ventus vs. human styling; a disabled "Reply" composer at bottom with a small "Static demo — replies are pre-scripted" note.
- `MessageBubble.tsx` — one email in a thread; Ventus messages get a purple accent + Sparkles icon, humans get neutral styling.
- `coworkerInboxData.ts` — hardcoded mock roster + threads (see below).

### 4. Mock data (`coworkerInboxData.ts`)
Hardcoded roster:
- **Advisors (4):** Sarah Chen, Marco Rossi, Priya Patel, James O'Brien — each with title, avatar initials, book size.
- **Leadership (2):** Elena Vasquez (Head of Wealth), David Kim (Regional Director).

Static threads (~6 total):

**Advisor threads (context = signals in that advisor's book):**
1. Ventus → Sarah Chen — "3 college-prep signals in your book this week" (lists 3 clients, evidence, recommended talking points). Sarah replies asking which to prioritize. Ventus responds with a ranked shortlist + suggested outreach copy.
2. Ventus → Marco Rossi — "Liquidity event detected: client Robert Hayes" (wire pattern + recommendation). Marco replies "schedule a call this week." Ventus responds with 3 proposed time slots + a draft agenda.
3. Ventus → Priya Patel — "Retirement-planning cluster in your book" (4 clients hitting age/behavior thresholds).

**Leadership threads (context = portfolio-wide trends & campaigns):**
4. Ventus → Elena Vasquez — "Weekly trends: HNW life-event volume +18%, top pillar = education planning." Elena replies "any product gaps?" Ventus responds with 2 product-line recommendations and a suggested campaign brief.
5. Ventus → David Kim — "Regional signal: outbound wealth transfer to competitors up in NW region" (with campaign recommendation).
6. Ventus → Elena Vasquez — "Recommended campaign: 529 plan cross-sell to 42 identified households" (with expected uplift).

Each thread is 3–5 messages. All content is copy in the data file; nothing is generated.

### 5. Interactions
- Click folder → filter thread list.
- Click thread → render detail pane.
- Click advisor/leader in roster → filter threads to that person.
- Reply composer is visible but disabled with a tooltip; no send.
- No routing to `AdvisorConsole` from inbox — inbox is self-contained.

## Explicitly out of scope
- No real email sending. `send-follow-up-email` untouched.
- No changes to `AdvisorConsole`, `LifeEventsAlertDashboard`, `AdvisorNotificationsView`, or `AIAssistantActivityView` internals.
- No merge with Wealth Intelligence section (deferred).
- No LLM/edge-function calls.
- No new backend, tables, or memory files.
- No sidebar restructure beyond the label rename.

## Files touched

**Edited (2):**
- `src/pages/analytics/AnalyticsContainer.tsx` — rename nav label.
- `src/components/tepilot/insights/BankwideWMCopilotView.tsx` — add 4th toggle, default to Coworker Inbox, update `TabHeader` copy, render `<CoworkerInboxView />`.

**Created (5):**
- `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx`
- `src/components/tepilot/coworker-inbox/ThreadList.tsx`
- `src/components/tepilot/coworker-inbox/ThreadDetail.tsx`
- `src/components/tepilot/coworker-inbox/MessageBubble.tsx`
- `src/components/tepilot/coworker-inbox/coworkerInboxData.ts`

## Verification
- `tsgo --noEmit` clean.
- WM Coworker nav label appears in sidebar in the current WM Copilot slot.
- Default landing is Coworker Inbox; existing three tabs still function unchanged.
- Clicking through folders, roster, and threads updates panes; all 6 threads render fully.
