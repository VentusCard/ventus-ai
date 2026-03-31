## Plan: Redesign Panel as 75% Screen Popup Dialog

### Overview

Convert the current side panel into a centered modal dialog that takes 75% of the screen. Two-column layout: customer selection on the left, platform module configuration on the right with color-coded checkboxes and descriptive questions.

### Changes

`**src/components/demo/DemoCustomerPanel.tsx**` — Full rewrite of the component

Layout becomes a Dialog (from `@/components/ui/dialog`):

- **75% viewport width/height**, centered, with clean white background and subtle shadow
- **Header**: "Ventus AI" title + subtitle, same as current
- **Two-column body** (`grid grid-cols-2 gap-8`):
  - **Left column**: "Select Customer" — dropdown, demographics, transaction summary table (existing CustomerSlot content)
  - **Right column**: "Platform Modules" — redesigned checkboxes

**Right column module design** — each module is a card-like row:

```text
┌─────────────────────────────────────────────────┐
│ ☑ Analytics (always on, disabled)               │
│   Ventus AI Customer Intelligence and Analytics │
│   ─ blue left border accent                     │
├─────────────────────────────────────────────────┤
│ ☑ AI & UX                                      │
│   AI-powered experience personalization engine  │
│   ─ blue left border accent                     │
├─────────────────────────────────────────────────┤
│ ☑ Rewards                                       │
│   Smart rewards optimization and deal matching  │
│   ─ emerald left border accent                  │
├─────────────────────────────────────────────────┤
│ ☑ Relationship                                  │
│   Life event detection and relationship mgmt    │
│   ─ purple left border accent                   │
└─────────────────────────────────────────────────┘
```

Each row:

- Colored left border (`border-l-3`) matching the module's color (blue / emerald / purple)
- Checkbox with matching accent color via inline style or data attribute
- Module name in bold, description underneath in muted text
- `All` toggle pill above the list

**Footer**: "Enrich Customer" button spanning full width + status/phase dots

`**src/pages/DemoPage.tsx**` — Refactor panel integration

- Remove the side panel `<div>` and collapse logic (`panelCollapsed`, `setPanelCollapsed`)
- Add `panelOpen` boolean state (default `true`)
- DemoCustomerPanel becomes a controlled dialog: `open={panelOpen}` / `onOpenChange={setPanelOpen}`
- "Show Panel" button at bottom-left opens the dialog
- On "Enrich", the dialog closes automatically
- Logo + one-liner always visible in top-left since panel no longer occupies side space
- Network diagram gets full width

### Module color mapping

- **Analytics**: `border-l-blue-500`, checkbox accent blue
- **AI & UX**: `border-l-sky-500`, checkbox accent sky
- **Rewards**: `border-l-emerald-500`, checkbox accent emerald
- **Relationship**: `border-l-purple-500`, checkbox accent purple

### Module descriptions (next to each checkbox)

- Analytics: "Core transaction classification, spending analytics, and customer profiling"
- AI & UX: "AI-powered experience personalization and predictive engagement"
- Rewards: "Smart rewards optimization, deal matching, and offer personalization"
- Relationship: "Life event detection, wealth signals, and relationship management"

Collapse:

when closed, use the exitsing "Panel" button on the top left of the network diagram