Restructure the Notifications tab so the horizontal navigator becomes the **primary chrome above the email window**, and the email window shows **one message at a time** (carousel), instead of a scrollable stack of all six.

## File
`src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx` — significant refactor. Props unchanged.

## New layout (top → bottom)

```text
┌────────────────────────────────────────────────────────────────────┐
│  ← [1·Ventus·Digest] [2·You·9:22] [3·Ventus·9:38] … [6·You·10:07] →│  ← primary nav, above the email card
└────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────┐
│  Outlook ribbon                                                    │
│  Subject: "Daily digest — N signals to action"  (or "Re: …")       │
│  Sender block: avatar · name · email · timestamp · pills           │
│  Body: content for the currently-active message ONLY               │
│  Signature                                                         │
└────────────────────────────────────────────────────────────────────┘
```

Only the active message's email is rendered. Switching pills swaps the email content — no scrolling between messages.

## Nav strip (new, above the email card)
- Rendered inside `AdvisorNotificationsView`, above the white email card, inside a slim white sticky-ish bar: `sticky top-0 z-10 bg-slate-100/95 backdrop-blur border-b border-slate-200 py-2`.
- Left: Prev button (`ChevronLeft`, disabled at index 0).
- Center/scroll: horizontal pill row (`overflow-x-auto`, hidden scrollbar) with one pill per message. Pill shape/state matches the current design: active = `bg-slate-900 text-white`, inactive = `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50`. Pill content: colored sender dot + `{index} · {sender short name} · {time or "Digest"}`.
- Right: Next button (`ChevronRight`, disabled at last index).
- On mount and when `activeIndex` changes, scroll the active pill into view within the strip (`scrollIntoView({ inline: "center", block: "nearest" })`), so long threads stay navigable.

## State & message model
- Lift `activeIndex` into `AdvisorNotificationsView` (currently lives in `ConversationThread`).
- Build one unified `MESSAGES` array of 6 entries with a discriminated shape:
  - `{ kind: "digest", sender: "ventus", time: "9:14 AM", subjectMode: "original" }`
  - `{ kind: "reply", sender, time, subjectMode: "reply", quoted, body }` for the 5 replies (same copy as today).
- `ConversationThread` component is removed; its reply bodies move into the `MESSAGES` array (kept as JSX factories that receive `nameA/nameB/labelA/labelB`).

## Email window (single-message renderer)
- The existing outer `bg-white border border-slate-200 rounded-md` card stays.
- Ribbon: unchanged, always shown.
- Subject line: `Daily digest — {totalSignals} signals to action` for the digest; `Re: Daily digest — {totalSignals} signals to action` for replies. Below the subject, small muted breadcrumb: `Message {activeIndex + 1} of 6`.
- Sender block: dynamic. Digest = current Ventus block (avatar VA/blue, "Ventus AI Copilot", email, Inbox + Daily Digest pills, timestamp). Reply = the sender for that message (Ventus blue or advisor slate), matching email and timestamp, with a single `Reply` pill instead of `Daily Digest`.
- Body slot:
  - Digest → the existing grouped-signal sections (`Act now / Opportunities / At risk`) with per-row Open/Prepare buttons. Wire remains identical (`onOpenClient`, `onPrepareWithVentus`).
  - Reply → the reply's quoted strip + body JSX, same styling as today but rendered at full email width (no card-in-card). No more small message cards.
- Signature block stays at the bottom.

## Behavior
- Switching to a reply message renders that message only; the digest disappears from view (it comes back when the user selects pill 1). This is intentional per the request: "show one thread at a time."
- Keep smooth transitions minimal: a subtle `transition-opacity` when the body swaps (`key={activeIndex}` on the body wrapper is fine — no framer motion).
- No URL sync, no keyboard shortcuts.

## Cleanup
- Remove the in-card `Conversation (N)` divider, nav strip inside the card, and per-message border cards from the previous iteration — the outside strip is now the only navigator.
- Remove now-unused imports if any.
- Keep `id="msg-0"` off (no longer needed since we don't scrollIntoView).

## Copy guardrails
Same as prior turn: vaguely specific, no timing pressure, references clients by name, no competitor/infra terms.

No other files change.