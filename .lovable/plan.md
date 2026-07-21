
## Scope

In the **Next-Conversation** tab of `/bankdemo`, replace both toggle views (Customer / Ventus AI Coworker) with **static feature/capability summaries** that fill the panel without any inner scroll.

Only `src/components/exec-demo/NextConversationRationale.tsx` changes. No logic or backend touched.

## Current problems

- **Customer view** (`Regular Client` panel): two stacked cards inside a scrollable container — content is thin but the scroll wrapper still shows.
- **Coworker view**: embeds the full `CoworkerInboxView` (267 lines, real inbox with thread navigation) — makes the panel scroll heavily and doesn't communicate "what it does" at a glance.

## Fix

Rebuild both branches of the `audience === "customer" | "rm"` block as **fixed, non-scrolling capability panels**.

### Customer view — "AI Banking Assistant"
Header pill: blue dot + "AI Banking Assistant". Body is a 2-row vertical grid (`grid-rows-2 gap-2 min-h-0`) with equal-height cards:

1. **Context it has** — 3 bullets: Recent spending pattern · Account holdings · Recent product interactions.
2. **Conversations it handles** — 3 bullets rendered as chat-bubble rows: "What products fit my situation?" · "Show me relevant offers" · "Explain this charge".

Card layout uses `flex-1 min-h-0`, container uses `overflow-hidden` (no `overflow-y-auto`). Text sizes tuned to fit ~360px column height.

### Coworker view — "Ventus AI Coworker"
Header pill: purple sparkle + "Ventus AI Coworker". Body is a 2-row vertical grid, equal-height:

1. **What it does for the advisor** — 3 bullets: Digests overnight signals into a morning briefing · Builds candidate lists for product campaigns · Drafts follow-up emails with evidence.
2. **Where it plugs in** — 3 bullets shown as small pill chips: Advisor inbox · CRM tasks · Approval-gated outreach.

`CoworkerInboxView` import removed from this file (the real inbox lives in the Coworker tab already).

### Shared shell tweaks

- Outer wrapper: keep `PipelineSliver` on top, then a single card that fills remaining height (`flex-1 min-h-0`), `overflow-hidden`.
- No `overflow-y-auto` anywhere in either branch.
- Both branches share the same 2-row equal-height card structure so the toggle feels symmetric.

## Out of scope

- The audience toggle itself and how `audience` is passed from `ExecDemoPage.tsx`.
- The phone-side (right panel) content.
- `CoworkerInboxView` (still used by the Coworker top-level tab).
