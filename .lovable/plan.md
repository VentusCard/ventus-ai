## Scope

Reframe the **Coworker Inbox** tab as a **Ventus AI Coworker — Status Dashboard**. It should read as "here's what your AI teammate has been doing," not as an email client. Keep exactly one advisor thread and one leadership thread as illustrative examples embedded in the dashboard.

Nav label stays `Coworker Inbox` in the toggle group (unchanged), but the surface it renders becomes a status dashboard.

## New layout — top to bottom, single scrolling column inside the tab

### 1. Status header strip
Compact banner with:
- Left: pulsing green dot + "Ventus AI Coworker · Active"
- Middle: subtle line "Working alongside 4 advisors and 2 leaders · Last activity 4 min ago"
- Right: small stat "This week: 23 emails sent · 14 replies · 9 threads active"

### 2. Activity stats row (4 KPI cards)
- **Emails sent this week** — 23 (↑ from 18)
- **Reply rate** — 61% (14 of 23)
- **Signals surfaced** — 47 (across advisor books)
- **Avg time-to-first-reply** — 2.3 hrs

Each is a small light-theme card: label, big number, delta chip.

### 3. "What Ventus is working on" — live activity feed (left) + roster status (right), 2-col grid
- **Left col (spans 2/3):** vertical timeline, 6–8 mock entries showing recent Ventus actions with timestamps and small type badges:
  - "Sent brief to Sarah Chen — 3 college-prep signals" · 9 min ago · [Advisor]
  - "Drafted campaign brief for Elena Vasquez review" · 32 min ago · [Leadership]
  - "Detected liquidity event: Robert Hayes ($2.4M wire)" · 1 hr ago · [Signal]
  - "Received reply from Marco Rossi — scheduling next step" · 1 hr ago · [Reply]
  - "Prepared retirement outreach drafts for Priya Patel (4)" · 2 hr ago · [Advisor]
  - "Sent weekly wealth pulse to Elena Vasquez" · 3 hr ago · [Leadership]
  - "Flagged NW outbound-transfer trend — $12M to competitors" · 5 hr ago · [Signal]
  - "Routed retention brief for David Kim's approval" · 6 hr ago · [Leadership]
  Each row: colored dot (purple advisor / amber leadership / blue signal / green reply), title, timestamp.
- **Right col (spans 1/3):** "Team status" — roster (from existing `coworkerInboxData.ts`) rendered as compact rows: avatar initials, name, title, and a small badge showing # of active Ventus threads with them (e.g. "2 threads", "1 pending reply").

### 4. Example threads section
Header: **Example conversations** · subtitle: "How Ventus works with the wealth team"

Two side-by-side cards (2-col grid, gap-4):
- **Left card:** advisor example — thread `t1` (Sarah Chen · "3 college-prep signals in your book this week")
- **Right card:** leadership example — thread `t4` (Elena Vasquez · "Weekly trends — HNW life-event volume +18%")

Each card:
- Header: recipient avatar + name + role badge ("Advisor" / "Leadership")
- Subject line (bold)
- Full inline thread of messages using the existing `MessageBubble` component (all 3 messages of each thread visible, no click required)
- Slightly muted background (bg-slate-50) with border to feel like a "preview" card rather than an interactive inbox
- No reply composer

### 5. Bottom footer strip
Small text: "Static demo — activity, threads, and stats are illustrative." with a subtle sparkle icon.

## Files touched

**Edited (2):**
- `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx` — replaced entirely with the new dashboard layout. Drops folder/thread-list/detail 3-pane layout, roster filtering, and thread selection state. Imports `MessageBubble` and pulls `THREADS`/`ROSTER` from the existing data file.
- `src/components/tepilot/coworker-inbox/coworkerInboxData.ts` — small additions only: an `ACTIVITY_FEED` array of 8 hardcoded activity entries (id, kind, title, timestamp, actorId?) and a `WEEKLY_STATS` object (emails sent, reply rate, signals, avg time-to-reply). Existing `THREADS` and `ROSTER` untouched.

**Unchanged / removed usage (no file deletions this pass):**
- `ThreadList.tsx`, `ThreadDetail.tsx` — no longer imported by the dashboard; kept in place unused (safe to remove in a follow-up if desired).
- `MessageBubble.tsx` — still used, embedded inside the two example thread cards.

## Explicitly out of scope
- No changes to the WM Coworker parent (`BankwideWMCopilotView.tsx`), the toggle group, or the Dashboard / Notifications tabs.
- No changes to sidebar nav.
- No real interactivity beyond hover states; no filters, no clicks that open panes.
- No new data types, backend, or memory files.

## Verification
- `tsgo --noEmit` clean.
- Coworker Inbox tab shows: status header → 4 KPI cards → activity feed + team status grid → two example thread cards side-by-side → footer disclaimer.
- Both example threads render all 3 messages inline via `MessageBubble`.
- Toggle group still shows Coworker Inbox | Dashboard | Notifications and switches work.
