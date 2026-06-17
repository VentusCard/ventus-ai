Redesign the WM Copilot → Notifications view so it looks like an actual inbound email opened in **Outlook desktop**, instead of the current generic envelope card.

## What changes

Only `src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx`. No data or routing changes; same props (`clients`, `onOpenClient`, `onPrepareWithVentus`).

## Outlook-style layout

```text
┌─────────────────────────────────────────────────────────────┐
│  Ribbon: Reply  Reply All  Forward  | Delete  Archive  Flag │  ← disabled, decorative
├─────────────────────────────────────────────────────────────┤
│  Subject:  Daily Signal Digest — 12 new triggers …          │  ← large, bold
│  ────────────────────────────────────────────────────────── │
│  [VA]  Ventus AI Copilot <copilot@ventusai.com>     9:02 AM │
│        To: You  Cc: —                          Wed Jun 17   │
│        [Inbox] [Daily Digest]   ⭐  ⚑                       │  ← Outlook category pills
├─────────────────────────────────────────────────────────────┤
│  Email body (white, serif-free, 14px):                      │
│  "Good morning — overnight I reviewed…"                     │
│                                                             │
│  ▸ High-priority life events (N)                            │
│     · client rows (kept from current design, restyled)      │
│  ▸ Opportunity triggers (N)                                 │
│  ▸ At-risk signals (N)                                      │
│                                                             │
│  — Ventus, your copilot                                     │
└─────────────────────────────────────────────────────────────┘
```

## Visual spec (Outlook desktop look, light theme only)

- Outer frame: white card, 1px `border-slate-200`, subtle shadow, max-width ~960px centered on `bg-slate-100` page background (Outlook reading pane feel).
- **Ribbon bar**: thin top strip, `bg-slate-50` + bottom border, small ghost buttons with lucide icons (`Reply`, `ReplyAll`, `Forward`, `Trash2`, `Archive`, `Flag`). Decorative — non-interactive (`disabled`, `cursor-default`), no toasts.
- **Subject line block**: `text-xl font-semibold text-slate-900`, padded, separator line under it.
- **Sender block**: avatar circle with "VA" monogram in Outlook blue `#0078D4`; sender name bold, email in `text-slate-500`; right-aligned timestamp + date; second row "To: You · daily digest"; small category pills using Outlook palette (blue `#E5F1FB` bg / `#0078D4` text for "Inbox", purple `#F3E8FF` / `#6B21A8` for "Daily Digest"); decorative star + flag icons.
- **Body**: same three priority sections as today, but restyled to feel like email content (not dashboard cards):
  - Section heading uses a small colored left-border accent (amber/emerald/rose) + bold label, no filled background — closer to formatted email bullets.
  - Each client row becomes a compact "line item" with avatar initials, name (bold), event label (muted), evidence line, and two right-aligned buttons (`Open`, `Prepare`). Keep existing handlers.
- **Signature**: italic-free, two short lines + small "Sent by Ventus Copilot · ventusai.com" footer in `text-slate-400`.
- No Salesforce chrome anywhere.
- Strict light theme; no `dark:` classes; reuse existing tokens and `lucide-react`.

## Behavior

- Buttons in the ribbon are visual only.
- `Open` and `Prepare` rows continue to call `onOpenClient` / `onPrepareWithVentus` exactly as today.
- Empty state ("book is quiet today") preserved, styled as italic email line inside the body.
- Domain stays `ventusai.com` per existing memory rule.