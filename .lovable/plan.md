## Arrow navigation across the entire /demo flow

Today the `/demo` page already supports `←` / `→` arrow keys, but only for stepping between the **3 final tabs** (Next-Offer → Next-Product → Next-Conversation), and only after one of those tabs is open (`phase === "hold" && activeTab`). You want the arrows to walk the *whole* journey end-to-end and let you go back at any point.

### The 6 stages of the flow

| # | Stage | State signature |
|---|---|---|
| 1 | **Data Selection dialog** | `selectionDialogOpen === true` |
| 2 | **Enrichment** (full-width transaction table being classified) | `phase === "hold" && !synthesisTriggered && !activeTab` |
| 3 | **Behavioral Intelligence** (persona synthesis + signal pills, action buttons visible) | `synthesisTriggered === true && !activeTab` |
| 4 | **Next-Offer** | `activeTab === "analytics"` |
| 5 | **Next-Product** | `activeTab === "product"` |
| 6 | **Next-Conversation** | `activeTab === "relationship"` |

### What changes

**1. Replace the existing keyboard handler in `src/pages/ExecDemoPage.tsx` (lines 854–879)** with a single global stage controller. Compute the current stage index from the existing state (no new source of truth — just a derived value), then handle `→` / `←` / `Backspace` as transitions between adjacent stages.

Forward (`→`) transitions:
- Stage 1 → 2: close selection dialog *and* call `handleRunAnalysis()` if no profile is loaded yet; if a profile is already loaded, just close the dialog.
- Stage 2 → 3: set `synthesisTriggered = true` (mirrors clicking the existing "Synthesize Behavioral Intelligence" CTA).
- Stage 3 → 4: `setActiveTab("analytics")` via the existing `handleTabClick`.
- Stage 4 → 5 → 6: walk `TAB_ORDER` (already implemented logic, kept).
- Stage 6: no-op (end of flow).

Backward (`←`) transitions are the inverse:
- Stage 6 → 5 → 4: walk back through `TAB_ORDER`.
- Stage 4 → 3: `setActiveTab(null)` (returns to the Behavioral Intelligence view with action buttons).
- Stage 3 → 2: `setSynthesisTriggered(false)` (back to the enrichment view).
- Stage 2 → 1: `setSelectionDialogOpen(true)` (re-opens the selection dialog without wiping the loaded profile).
- Stage 1: no-op.

**Backspace = jump back one stage** (same as `←`). `Alt+ArrowLeft` does the same — kept as an alias.

Guard rails:
- Ignore the keystroke when the event target is an `<input>`, `<textarea>`, or `[contenteditable]` so typing in the selection dialog isn't hijacked.
- Disable forward from Stage 1 if no profile is selected/loaded (i.e., user must pick a customer or paste a CSV first — the "Run Analysis" button already enforces this; we just call it).

**2. Visible UI affordance — floating bottom-center pill** in `src/pages/ExecDemoPage.tsx`, rendered alongside the existing demo chrome:

```text
   ┌────────────────────────────────────────────┐
   │  ◀  Back     [ Stage 4 of 6 · Next-Offer ]     Next  ▶  │
   └────────────────────────────────────────────┘
```

- Three controls: `Back` button, current stage label + dot indicator (6 dots, current one filled), `Next` button.
- Buttons disabled at the ends of the flow; reuse the same handlers as the keyboard shortcuts.
- Lucide icons: `ChevronLeft`, `ChevronRight`. Light theme only (white bg, `border-slate-200`, `text-slate-700`, hover `bg-slate-50`) — no `dark:` utilities.
- Hidden entirely until the user has done *something* (i.e., `selectionDialogOpen === false || phase !== "idle"`), so it doesn't sit on top of the empty start state. Actually keep it visible from the start with the dialog open so users discover it — the dialog is modal and overlays the pill, which is fine.
- Position: `fixed bottom-4 left-1/2 -translate-x-1/2 z-40`, rounded-full, subtle shadow.

### Why no separate "history stack"

The flow is linear and reversible (each backward transition is just the inverse of the forward one). A history stack would let the user jump non-adjacent (e.g., Stage 6 → Stage 2 in one click), but you described a left/right swap with "go back to previous view if needed", which one-step-back already covers. If you later want a free jump, we can layer a stack on top — but starting simple keeps the affordance obvious.

### Files touched

- `src/pages/ExecDemoPage.tsx` — replace the keyboard handler (lines 854–879), add stage-derivation helper + `goNext` / `goBack` callbacks, render the floating navigator pill in the JSX tree near the existing fixed UI (around the `<ExecDemoSelectionDialog>` mount).

No changes to `ExecDemoIntelPanel.tsx` — it already exposes everything we need via the props the page passes in.

### Out of scope

- No URL/router changes; browser back/forward stays untouched.
- No animation between stages beyond what already exists.
- No mobile/touch swipe gestures (demo is desktop-only per project rules).