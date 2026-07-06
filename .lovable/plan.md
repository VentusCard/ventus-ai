Remove the "Dashboard" toggle from the WM Coworker view in `/bankdemo`, leaving only "Coworker Inbox" and "Notifications".

Changes in `src/components/tepilot/insights/BankwideWMCopilotView.tsx`:
1. Narrow `ViewMode` to `"inbox" | "notifications"`.
2. Delete the Dashboard `<Button>` block (lines ~60–73) and remove the `LayoutDashboard` import.
3. Simplify the content render to a two-branch conditional (inbox vs notifications), dropping the `LifeEventsAlertDashboard` branch and its import.
4. Remove now-unused handlers (`handleOpenClient`, `handleScheduleCall`, `handlePrepareWithVentus`) and the `EventPreparationData` import if no longer referenced — keep `dashboardClients` since `AdvisorNotificationsView` still uses it (and its `onOpenClient` / `onPrepareWithVentus` props, which will keep minimal toast-based stubs).

No other files affected.