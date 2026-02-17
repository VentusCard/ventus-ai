

# Fix: Ensure Client Context Fully Overwrites When Switching from Dashboard

## Problem
When an advisor selects a client from the Life Events Dashboard (or clicks "Prepare with Ventus"), the system writes the new client's profile and events to `sessionStorage`. However, `AdvisorConsole` only reads `sessionStorage` once on mount (guarded by `isInitialized`). Since the component stays mounted when toggling between dashboard and client views, selecting a second client has no effect -- the first client's data remains displayed.

## Root Cause
- `AdvisorConsolePage` keeps both `LifeEventsAlertDashboard` and `AdvisorConsole` rendered, toggling visibility via `viewMode`
- `AdvisorConsole` reads sessionStorage in a `useEffect` gated by `isInitialized` (line 92). Once true, it never re-reads
- The parent writes new client data to sessionStorage but the child never picks it up

## Solution
Pass the selected client's profile and dashboard events directly as props from `AdvisorConsolePage` to `AdvisorConsole`, bypassing the stale sessionStorage read. Additionally, reset `isInitialized` when the selected client changes so the component picks up the new data.

### Changes

**1. `src/pages/AdvisorConsolePage.tsx`**
- Pass `selectedClientProfile` and `selectedDashboardEvents` as new props to `AdvisorConsole`
- Derive these from `selectedClientId` + `dashboardClients` lookup

**2. `src/components/tepilot/advisor-console/AdvisorConsole.tsx`**
- Add `selectedClientProfile?: ClientProfileData` and `selectedDashboardEvents?: DetectedLifeEvent[]` to the props interface
- When these props change (new client selected), directly apply them: set `clientProfile`, `dashboardEvents`, generate new psychological insights, clear stale action items, and persist to sessionStorage
- This replaces the indirect "write to sessionStorage, hope the child re-reads" pattern with direct React prop flow

### Why Not Just Reset `isInitialized`?
Resetting `isInitialized` alone would re-trigger the mount effect, but it would also re-read potentially stale sessionStorage from other sources. Direct prop passing is the idiomatic React approach and guarantees the correct client data is used.

## Files
- **Modify**: `src/pages/AdvisorConsolePage.tsx` -- pass client profile and events as props
- **Modify**: `src/components/tepilot/advisor-console/AdvisorConsole.tsx` -- accept and react to new client props
