## Goal

In `/bankdemo` → Next Conversation tab, rename the "Relationship Managers" toggle to **"Ventus AI Coworker"** and replace the current RM-side card content with the actual demo flow used in the standalone Co-worker tab (advisor ↔ Ventus email threads with Morgan, activity feed, KPI strip).

## Changes

### 1. `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- Rename the toggle button label from `Relationship Managers` → `Ventus AI Coworker` (line 1278).
- Keep the same toggle mechanic (`onCloseWMCopilot` / `onOpenWMCopilot`) and purple accent color so the right-side tablet mockup still swaps to the WM CoPilot phone view.

### 2. `src/components/exec-demo/NextConversationRationale.tsx`
- When `audience === "rm"`, replace the existing "Wealth Client → Advisor Notification" card block (lines ~403–486) with an embedded rendering of the Co-worker inbox demo flow.
- Import and render `CoworkerInboxView` from `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx` inside the RM panel container (keep the outer purple-bordered rounded shell + "Ventus AI Coworker" header strip for visual consistency with the toggle).
- Strip the outer `overflow-y-auto pr-1` wrapping by scoping CoworkerInboxView inside a `min-h-0` flex container so it scrolls within the panel rather than the page.

### 3. No changes to the customer audience path, no backend changes, no changes to `WMCopilotPhoneView` (the right-side tablet keeps showing the WM CoPilot brief when RM/Coworker is selected).

## Technical notes
- `CoworkerInboxView` is self-contained (pulls its own data from `coworkerInboxData.ts`) — no new props required.
- Panel height: wrap in `<div className="h-full min-h-0 overflow-hidden">` so the internal `overflow-y-auto` in CoworkerInboxView takes over scroll behavior inside the fixed panel.
- No route or navigation changes.

## Out of scope
- Editing the standalone Co-worker tab itself.
- Any new thread content / data changes.
