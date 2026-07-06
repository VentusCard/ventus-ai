## Scope

Rescale the Ventus AI Coworker dashboard to Merrill-Lynch–size numbers, fix the reply-time metric (Ventus replies instantly), and add a clear "capabilities" panel so viewers immediately understand what the AI coworker does.

## Changes

### 1. Rescale metrics for a Merrill-scale wirehouse
Merrill Lynch reference: ~14,000 advisors, ~$1.5T AUM, ~3M households.

Update `WEEKLY_STATS` in `coworkerInboxData.ts`:
- `advisorsCount`: 4 → **12,400** (advisors served)
- `leadersCount`: 2 → **340** (regional leaders + market execs)
- `emailsSent`: 23 → **28,450** (this week)
- `emailsSentPrev`: 18 → **24,180**
- `repliesCount`: 14 → **17,320**
- `replyRatePct`: 61 → **61** (unchanged, still reads well)
- `signalsSurfaced`: 47 → **142,800** (across all advisor books this week)
- `activeThreads`: 9 → **9,640**
- `lastActivityAgo`: keep "4 sec ago" (was "4 min ago") to reinforce always-on

Remove `avgTimeToReplyHrs` and add:
- `ventusReplyLatency`: **"< 1 sec"** — Ventus's own response time
- `advisorReplyMedianHrs`: **1.8** — median human reply time back to Ventus (kept as context, but relabeled clearly)

### 2. Fix the "reply time" KPI card
The 4th KPI card no longer shows "Avg time to first reply — 2.3 hrs" (misleading — that implied Ventus was slow). Replace with:
- **Card 4: "Ventus reply latency"** — value: `< 1 sec` · subtext: `instant · always on` · icon: Zap/Bolt

Bump other cards' numbers to match new scale and add short subtext:
- Card 1: `Emails sent this week` — 28,450 · `↑ 17.6% vs last week`
- Card 2: `Human reply rate` — 61% · `17,320 replies received`
- Card 3: `Signals surfaced` — 142,800 · `across 12,400 advisor books`
- Card 4: `Ventus reply latency` — < 1 sec · `instant · always on`

### 3. Rescale status header strip
- Left: pulsing dot + "Ventus AI Coworker · Active"
- Middle: "Working alongside 12,400 advisors and 340 leaders · Last activity 4 sec ago"
- Right: "28,450 emails this week · 17,320 replies · 9,640 active threads"

### 4. Rescale Team Status roster
Keep the same 6 mock people (Sarah, Marco, Priya, James, Elena, David) — they're now sampled from thousands. Add a header caption above the list: "Sample of active collaborators (6 of 12,740)".

Per-person thread counts stay small (2–4) since these are individual advisor/leader threads.

### 5. Rescale Activity feed
Keep the same 8 entries — they read as recent individual actions. Update timestamps to feel faster (Ventus operates constantly):
- "9 min ago" → "42 sec ago"
- "32 min ago" → "3 min ago"
- "1 hr ago" (both) → "6 min ago" / "8 min ago"
- "2 hr ago" → "14 min ago"
- "3 hr ago" → "21 min ago"
- "5 hr ago" → "38 min ago"
- "6 hr ago" → "52 min ago"

Add feed header caption: "Live · updated continuously · showing 8 of 4,120 today"

### 6. New "Ventus AI Coworker Capabilities" panel
Insert a new section between the status header and the KPI cards (so it's the second thing viewers see). Full-width light card with a 3-column grid of capability tiles. Each tile: icon + short title + one-sentence description.

Six capabilities:

1. **Continuous signal detection** (icon: Radar) — "Scans every transaction across all client books in real time for life events, liquidity, and risk signals."
2. **Personalized advisor briefs** (icon: UserRoundCheck) — "Emails each advisor the specific signals in their book with context, evidence, and recommended talking points."
3. **Leadership intelligence** (icon: LineChart) — "Sends leadership weekly trends, product-gap analysis, and campaign recommendations across the enterprise."
4. **Instant conversational replies** (icon: MessageSquare) — "Replies in under a second when an advisor or leader responds — deeper context, drafts, next actions, or scheduling on demand."
5. **Draft generation** (icon: FileText) — "Produces client outreach copy, agendas, and campaign briefs ready for human review — never sends to end clients autonomously."
6. **Coordinated hand-offs** (icon: Workflow) — "Routes retention playbooks, escalations, and cross-advisor coordination without leadership having to chase."

Panel header: "**What your AI coworker does**" · subtitle: "Ventus works alongside 12,400 advisors and 340 leaders — via email, always on."

### 7. Update TabHeader copy on the parent (`BankwideWMCopilotView.tsx`)
- `subtitle`: unchanged.
- `howItWorks`: rewrite to emphasize scale + capabilities: "Ventus AI is an email-based coworker to the wealth team. It continuously scans behavior across 3M+ households, sends personalized signal briefs to individual advisors, delivers portfolio-wide trends and campaign recommendations to leadership, and replies instantly when anyone writes back."
- `whyItMatters`: "Enterprise-scale coverage without adding headcount. Every advisor gets a personal research assistant, every leader gets a real-time chief of staff — inside the tool they already use."

## Files touched

**Edited (3):**
- `src/components/tepilot/coworker-inbox/coworkerInboxData.ts` — update `WeeklyStats` interface and `WEEKLY_STATS` object; update `ACTIVITY_FEED` timestamps. Existing threads + roster + `PERSON_ACTIVITY` untouched.
- `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx` — add Capabilities panel section; swap 4th KPI card content; update status strip and Team Status caption; update Activity feed caption; use new stats fields with locale-formatted numbers (`.toLocaleString()`).
- `src/components/tepilot/insights/BankwideWMCopilotView.tsx` — update `TabHeader` `howItWorks` and `whyItMatters` copy only (title/subtitle/icon unchanged).

## Explicitly out of scope
- No changes to Dashboard / Notifications tabs, sidebar, or `MessageBubble`.
- No changes to the two example threads (still Sarah Chen + Elena Vasquez, unchanged text).
- No new files, no backend, no memory.

## Verification
- `tsgo --noEmit` clean.
- Status strip and KPIs show 12,400 advisors, 28,450 emails, < 1 sec Ventus latency.
- Capabilities panel visible directly under the status strip with 6 tiles.
- Activity feed timestamps are seconds/minutes, not hours.
