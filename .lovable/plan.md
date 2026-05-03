## Add "Pipeline Sliver" card to Next Conversation tab

Insert a thin, full-width card directly above the two client columns (Regular Client / Wealth Client) and below the intelligence pills, on the Next Conversation tab only.

### Layout

A single horizontal card, ~compact height (single row, no scroll), split into two halves by a vertical divider. Within each half, items are laid out **horizontally in a single line** (`flex` row, `whitespace-nowrap`, `overflow-hidden`); cut-offs at the right edge are acceptable.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ INGEST   Card & ACH · Merchant + MCC · Life events · Risk flags · Hold… │
│ HANDS OFF TO   AI Assistant · Email · Advisor alert · WM CoPilot · CRM… │
└──────────────────────────────────────────────────────────────────────────┘
```

(Two columns side-by-side, each containing label + horizontal chip row.)

Styling:
- Outer card: `rounded-xl border border-slate-200 bg-white px-4 py-2`.
- `grid grid-cols-2 divide-x divide-slate-200` — Ingest left, Hands Off To right.
- Each side: `flex items-center gap-3 overflow-hidden` with the section label on the left.
- Section label: `text-[10px] font-semibold tracking-wider text-slate-500 uppercase shrink-0`, paired with a small lucide icon (`Inbox` for Ingest, `Send` for Hands Off To).
- Items: rendered as inline chips `text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5 shrink-0`, separated by `gap-1.5`. Container has `overflow-hidden` so items beyond the width simply clip.

### Implementation

Edit `src/components/exec-demo/NextConversationRationale.tsx`:

1. Add a small inline `PipelineSliver` block at the top of the main render.
2. Wrap the existing two-column grid in a `flex flex-col min-h-0 gap-3` container; sliver is `shrink-0`, the two-column grid below gets `flex-1 min-h-0`.
3. Render the sliver in both branches (the empty "select a signal" state and the resolved-brief state) so it's always present on this tab.

### Content

Ingest (5 chips):
- Card & ACH transactions
- Merchant + MCC enrichment
- Life event signals
- Risk & wellness flags
- Account & product holdings

Hands Off To (5 chips):
- AI Banking Assistant
- Personalized email
- Wealth Advisor alert
- WM CoPilot brief
- CRM follow-up task

### Out of scope

- No changes to pills, the two client columns, the right phone panel, or any other tab.
