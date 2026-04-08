

## Plan: Wide Card Selection Popup (tepilot-style)

### What Changes

Replace the current two-column dialog with a **two-phase** approach:

**Phase 1 — Selection (no customer yet, or user clicks "Change")**
The dialog renders a single wide `Card` component (matching tepilot's `UploadOrPasteContainer` style) — no grid split, no modules column. The card spans the full dialog width (`max-w-4xl`).

Layout inside the Card:
- `CardHeader`: Title "Transaction Enrichment Setup" + description "Select a sample customer or load custom data"
- Below title: a row of buttons — one pill per `DEMO_CUSTOMERS` name + a "Custom" pill (styled like tepilot's `Load Sample Data` / `Paste Text` / `Upload Files` buttons using `Button` component with `variant="default"` for active, `variant="outline"` for inactive, `size="sm"`, `flex-1`)
- `CardContent`: The transaction preview table (headers always visible, empty state when nothing selected). Custom paste flow also renders here when "Custom" is active.
- Footer area: "Create Experience" button

**Phase 2 — Configuration (customer already selected, dialog reopened)**
Shows the existing two-column layout (customer summary on left with "Change" button, modules on right). Clicking "Change" returns to Phase 1.

### File: `src/components/demo/DemoCustomerPanel.tsx`

1. Add `selectionPhase` state — defaults to `true` when `customer` is null, also set to `true` when user clicks "Change"
2. When `selectionPhase === true`:
   - Dialog uses `max-w-4xl` (wide single card, no grid)
   - Render a `Card` with `CardHeader` (title + description + button row) and `CardContent` (transaction table + custom flow)
   - Button row uses `Button` components with `flex-1` sizing, matching tepilot styling
   - No modules column visible
   - Footer has "Create Experience" button that triggers enrichment and flips to Phase 2
3. When `selectionPhase === false`:
   - Current two-column grid layout (`w-[60vw]`)
   - Left column shows selected customer name as highlighted pill + "Change" button + compact transaction table
   - Right column: module cards (unchanged)

