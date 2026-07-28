## Auto-rotating email reel on `/coworker`

Replace the full inbox-style `AdvisorConversationThread` embed with a slimmer, focused **email reel** that auto-advances through the same 7-message exchange (daily digest + 6 replies). Keep `/bankdemo` untouched — the change is scoped to the `/coworker` page.

### UX

- **Single-message stage.** One email visible at a time, centered on a soft surface. No sidebar, no ribbon.
- **Header strip.** Small "AI Coworker ↔ Advisor" pill, subject line, and sender/recipient row with avatar chips (Ventus violet / Morgan slate).
- **Auto-advance.** ~6s per message, looping. Pauses on hover or when the user manually jumps.
- **Progress rail.** Slim segmented bar across the top (7 segments) — the active segment fills as its timer runs. Segments are clickable to jump.
- **Prev/next controls.** Compact chevron buttons + timestamp label ("9:14 AM · 1 of 7").
- **Transitions.** `animate-fade-in` on message swap (existing utility). No layout jumps.
- **Height fixed** (~560px) so page scrolling stays smooth.

### Data reuse

- Reuse `REPLY_MESSAGES`, digest-row + travel-cohort derivations, `evidenceFor`, `offerFor`, `LIFE_EVENT_CONFIG`, `generateDashboardClients(60)`.
- Export the reusable message spec from `AdvisorConversationThread.tsx` (`REPLY_MESSAGES`, `Sender`, related types + helpers) so the new component doesn't duplicate content. If cleaner, extract them into a new sibling `advisorConversationContent.ts` and re-import from both places — no behavior change to `/bankdemo`.

### Files

- **New:** `src/components/coworker/CoworkerEmailReel.tsx` — the auto-rotating reel component.
- **Edit:** `src/components/tepilot/advisor-console/AdvisorConversationThread.tsx` — export the data/helpers the reel needs (no visual changes).
- **Edit:** `src/pages/CoworkerPage.tsx` — swap the framed `AdvisorConversationThread` embed for `<CoworkerEmailReel />`. Update the caption to reflect auto-play ("Auto-playing — hover to pause, click a step to jump").

### Out of scope

- No changes to `/bankdemo`'s Next Conversation tab or its tablet mockup.
- No new message content — same 7-step exchange.