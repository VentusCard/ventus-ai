

## Add Customer Selection Popup to `/demo` (ExecDemoPage)

### Overview
Add a large, full-screen dialog popup for initial customer selection on the `/demo` route. This popup will show on page load and whenever the user wants to switch customers mid-demo. It features browsable profile cards on the left and a live transaction preview on the right.

### Design

```text
┌─────────────────────────────────────────────────────────────────────┐
│  Ventus AI · Select a Customer Profile                         [X] │
├────────────────────────────────┬────────────────────────────────────┤
│  CUSTOMER PROFILES             │  TRANSACTION PREVIEW              │
│                                │                                   │
│  ┌──────────────────────────┐  │  Sarah Chen · 156 txns · $12,040  │
│  │ Sarah Chen            ✓  │  │  Wellness Explorer                │
│  │ Wellness Explorer        │  │  Industry: Tech · Income: $150K   │
│  │ 156 txns · $12,040       │  │  ─────────────────────────────    │
│  │ ✈️34% 🍽️22% 💪18% 🛍️14% │  │  Date    Merchant       Amt      │
│  └──────────────────────────┘  │  Aug 15  Equinox       $200       │
│  ┌──────────────────────────┐  │  Aug 16  Whole Foods   $157       │
│  │ Marcus Thompson          │  │  Aug 12  Delta Air     $450       │
│  │ Tech Enthusiast          │  │  ...scrollable...                 │
│  │ 180 txns · $14,200       │  │                                   │
│  └──────────────────────────┘  │  Sources: Premium · Cashback      │
│  ┌──────────────────────────┐  │                                   │
│  │ ...4 more customers...   │  │                                   │
│  └──────────────────────────┘  │                                   │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  │                                   │
│  │ ✏️ Custom (LLM Paste)   │  │                                   │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘  │                                   │
├────────────────────────────────┴────────────────────────────────────┤
│          [ ▶ Run Behavioral Enrichment ]                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Changes

**1. New component: `src/components/exec-demo/ExecDemoSelectionDialog.tsx`**

A `Dialog` component (~200 lines) with:
- **Left column**: Scrollable list of 6 `DEMO_CUSTOMERS` as clickable cards. Each card shows: name, `lifestyleType` subtitle, `txnCount` + `txnTotal` stats, and `topPillars` as small colored chips (icon + pct). Selected card has blue border + check. A dashed "Custom" card at the bottom opens the existing LLM paste flow (persona textarea, copy prompt, paste output).
- **Right column**: Transaction preview for the hovered/selected customer. Shows demographics (industry, income), summary stats (txn count, total, date range), source pills, and a scrollable table of `sampleTransactions`. Empty state when nothing selected.
- **Footer**: A single "Run Behavioral Enrichment" CTA button that selects the customer, closes the dialog, and triggers `onRunAnalysis`.
- Dialog is `w-[70vw] h-[80vh]`, uses existing `Dialog`/`DialogContent` from `src/components/ui/dialog.tsx`.

**2. `src/pages/ExecDemoPage.tsx`** — Minor additions:
- Add `selectionDialogOpen` state, initialized to `true` (opens on page load).
- Render `<ExecDemoSelectionDialog>` with props: `open`, `onOpenChange`, `selectedIdx`, `onSelectCustomer`, `onRunAnalysis`, `onLoadCustomCsv`, `customers: DEMO_CUSTOMERS`.
- Add a small "Change Customer" button in the top bar that sets `selectionDialogOpen(true)`.
- When user clicks "Change" in the left panel, open the dialog instead of inline card switching.

**3. `src/components/exec-demo/ExecDemoLeftPanel.tsx`** — Minor:
- Remove the customer card list and custom input flow (moved to dialog).
- Keep only the transaction feed display and run-analysis button.
- Accept new prop `onChangeCustomer` that opens the dialog instead of inline switching.
- Show current customer name/icon as a compact header with a "Change" link.

