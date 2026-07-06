## Problem
The Ventus AI Coworker section incorrectly implies Ventus can schedule calls, manage calendars, and send invites. Ventus only provides insights and signals — it does not take scheduling actions.

## Scope
Two files in `src/components/tepilot/coworker-inbox/`:
1. `CoworkerInboxView.tsx` — capabilities tile + deliverables summary rows
2. `coworkerInboxData.ts` — example thread messages + activity feed

## Changes

### `CoworkerInboxView.tsx`
1. **Capability tile "Instant conversational replies"** (line ~82):
   - Current: `...next actions, or scheduling on demand`
   - Change to: `...next actions, or deeper context on demand`
2. **Advisor deliverables sentence** (line ~89):
   - Current: `...plus instant replies when they ask for scheduling help or deeper context`
   - Change to: `...plus instant replies when they ask for deeper context or next-step recommendations`

### `coworkerInboxData.ts`
3. **Thread t1 (Sarah) — message t1m3** (line ~67):
   - Current: `Want me to schedule the calls?`
   - Change to: `Let me know if you'd like suggested next steps or outreach timing.`
4. **Thread t2 (Marco) — message t2m2** (line ~89):
   - Current: `Let's schedule a call this week. Can you find time?`
   - Change to: `Let's reach out this week. What timing should I suggest?`
5. **Thread t2 (Marco) — message t2m3** (lines ~92-97):
   - Current: proposes calendar slots and says "I'll send the invite"
   - Change to: Ventus suggests outreach timing, draft agenda, and asks Marco to confirm — no calendar slots or invites.
6. **Activity feed entry a4** (line ~263):
   - Current: `Received reply from Marco Rossi — scheduling next step`
   - Change to: `Received reply from Marco Rossi — confirming outreach timing`

## Out of scope
- KPI cards, team status, other capability tiles, and non-scheduling thread content remain untouched.
- No new components, no styling changes, no data structure changes.

## Validation
- Build passes with no TypeScript errors.
- No remaining "schedul" or "calendar" or "invite" references remain in the two files.