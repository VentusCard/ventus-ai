## Scope

Remove the **Client View** toggle from the WM Coworker section. The `AdvisorConsole` render branch and its supporting state stay in the file only to the extent needed by other paths — but since Client View is the only entry point to it here, we remove that too.

## Changes to `src/components/tepilot/insights/BankwideWMCopilotView.tsx`

- Remove the `Client View` button from the toggle pill group.
- Remove `"client"` from the `ViewMode` union → `type ViewMode = "inbox" | "dashboard" | "notifications"`.
- Change the fallback `else` branch (which currently renders `<AdvisorConsole …>`) — since only inbox / dashboard / notifications remain, restructure to explicit checks and drop the AdvisorConsole render entirely.
- Remove now-unused imports and state:
  - `AdvisorConsole` import
  - `User` icon import
  - `useNavigate` import (already unused after this)
  - `selectedClientId`, `selectedClient`, `pendingVentusMessage` state
  - `handleBackToDashboard`, `handlePrepareWithVentus` callbacks (both only feed AdvisorConsole/client view)
  - `buildEventPreparationPrompt` import
  - `EventPreparationData`, `DashboardClient` type imports if unused after cleanup
- Update `handleOpenClient` and `handlePrepareWithVentus` handlers passed into `LifeEventsAlertDashboard` / `AdvisorNotificationsView`: since Client View is gone, replace `onOpenClient` behavior with a toast ("Client detail view is disabled in this demo") and remove `onPrepareWithVentus` triggering a switch to client view — replace with a toast as well. Keep the props required by those child components.

## Out of scope
- No changes to `AdvisorConsole`, `LifeEventsAlertDashboard`, `AdvisorNotificationsView`, or the sidebar.
- No changes to the Coworker Inbox.

## Verification
- `tsgo --noEmit` clean.
- Toggle group shows: Coworker Inbox | Dashboard | Notifications.
- Clicking a client card in Dashboard/Notifications shows a toast instead of navigating.
