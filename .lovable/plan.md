## Goal
Redesign the horizontal message pill navigation in `AdvisorNotificationsView.tsx` so it is immediately obvious to any viewer what they are looking at and how to move through the conversation thread.

## What to Change
The sticky pill strip (lines ~569-618) currently shows a dense row of small numbered pills with colored dots. Users have trouble understanding its purpose at a glance.

## Proposed Redesign
1. **Add a descriptive headline** above the pill row — e.g. "Conversation with Ventus AI" or "Thread" — so the navigation has context.
2. **Enlarge and simplify the pills** — remove the middle dot separator, use bolder typography for the sender label, and make the active state unmistakable (solid fill + white text + stronger shadow vs. inactive ghost/outline style).
3. **Add subtle directional cues** — replace the plain chevron buttons with more prominent prev/next affordances, or add a "Message X of Y" counter between them.
4. **Increase vertical spacing** between the nav bar and the email content so the navigation feels like a distinct control layer, not part of the message.
5. **Color-code by sender more strongly** — Ventus pills use a blue accent, Advisor pills use a slate accent, making it obvious at a glance who sent what.

## Implementation Notes
- Keep the component fully in `AdvisorNotificationsView.tsx` — no new files needed.
- Preserve all existing functionality (click to jump, prev/next arrows, scroll-into-view behavior, sticky positioning).
- Maintain the strict light-theme policy (white/slate tones, no dark mode utilities).
- The change is purely presentational; no data/logic changes.

## Acceptance Criteria
- A headline or title is visible above the pill row explaining the thread.
- The active pill is visually dominant and instantly distinguishable from inactive pills.
- The navigation feels like a clear, separate control bar rather than a cramped row of labels.
- Build passes cleanly.