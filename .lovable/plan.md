Add a **horizontal message navigator** above the conversation thread in the Notifications tab, letting the advisor jump between the 6 messages in the thread.

## File
`src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx` — modify the existing `ConversationThread` component and include the original digest as message #1 in the nav.

## UI
Sticky-ish horizontal strip rendered just below the `Conversation (6)` label:

```text
[ 1 · Ventus · Digest ] [ 2 · You · 9:22 ] [ 3 · Ventus · 9:38 ] [ 4 · You · 9:44 ] [ 5 · Ventus · 10:02 ] [ 6 · You · 10:07 ]
                              ← Prev   Next →
```

- Row of pill buttons, one per message, in a horizontally scrollable flex container (`overflow-x-auto` with hidden scrollbar).
- Each pill: sender avatar dot (Ventus blue / advisor slate), small label like `1 · Ventus · Digest` or `2 · You · 9:22`, `whitespace-nowrap`.
- Active pill: `bg-slate-900 text-white`; inactive: `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50`.
- Small **Prev / Next** icon buttons at the right end of the strip (`ChevronLeft` / `ChevronRight`) that step the active index.

## Behavior
- Local `activeIndex` state (0 = digest, 1–5 = the five reply cards).
- Each rendered message card gets a `ref` (array of refs). Clicking a pill or Prev/Next scrolls that message into view with `ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })` and sets `activeIndex`.
- The digest card (message #1) is outside `ConversationThread` today — pass a `ref` down from `AdvisorNotificationsView` for the digest's outer container (or wrap the digest body section in a `forwardRef`-friendly `div` with an id) so the navigator can scroll to it too. Simplest: give the existing digest wrapper an `id="msg-0"` and have the navigator use `document.getElementById` for index 0, plus refs for indices 1–5. Keep it scoped inside the component; no window listeners needed.
- All messages remain fully rendered — this is jump-to-scroll, not a carousel.
- No keyboard shortcuts, no URL sync.

## Icons
Add `ChevronLeft`, `ChevronRight` to the existing `lucide-react` import.

## Copy guardrails
Pill labels use the sender's short name ("Ventus" / "You"), the message time, and message index — no additional metadata.

No other files change.